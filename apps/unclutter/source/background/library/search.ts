import type { Article } from "@unclutter/library-components/dist/store";
import {
    SearchIndex,
    SearchResult,
    syncSearchIndex,
} from "@unclutter/library-components/dist/common/search";
import { rep } from "./library";

let annotationsSearchIndex: SearchIndex;
let articlesSearchIndex: SearchIndex;
export async function initSearchIndex(forceReinit: boolean = false) {
    if (!annotationsSearchIndex || forceReinit) {
        console.log("Initializing highlights search index...");
        try {
            annotationsSearchIndex = new SearchIndex(""); // default for all users
            await syncSearchIndex(
                rep,
                annotationsSearchIndex as unknown as SearchIndex,
                false,
                true
            );
        } catch (err) {
            console.error(err);
            annotationsSearchIndex = null;
        }
    }
}

export async function search(
    type: "articles" | "annotations",
    query: string
): Promise<(SearchResult & { article: Article })[]> {
    if (type === "annotations") {
        return searchAnnotations(query);
    } else if (type === "articles") {
        return searchArticles(query);
    }
}

export async function searchAnnotations(
    query: string
): Promise<(SearchResult & { article: Article })[]> {
    if (!annotationsSearchIndex) {
        return;
    }

    const results = await annotationsSearchIndex.search(query, true, false);

    const resultsWithArticles = await Promise.all(
        results.map(async (hit) => {
            const annotation = await rep.query.getAnnotation(hit.id);
            const article = await rep.query.getArticle(annotation?.article_id);
            return {
                ...hit,
                annotation,
                article,
            };
        })
    );
    return resultsWithArticles.filter((hit) => hit.annotation !== undefined);
}

export async function searchArticles(
    query: string
): Promise<(SearchResult & { article: Article })[]> {
    if (!articlesSearchIndex) {
        return;
    }

    const results = await articlesSearchIndex.search(query, true, false);

    const resultsWithArticles = await Promise.all(
        results.map(async (hit) => {
            const article = await rep.query.getArticle(hit.id);
            return {
                ...hit,
                article,
            };
        })
    );
    return resultsWithArticles.filter((hit) => hit.article !== undefined);
}
