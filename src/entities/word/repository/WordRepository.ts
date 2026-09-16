import { Result } from "../../../shared/core/Result";
import { TargetWord } from "../domain/TargetWord";
import type { WordCategoryType } from "../domain/WordCategory";
import type { WordDefinition } from "../domain/WordDefinition";
import type { WordDifficultyType } from "../domain/WordDifficulty";

export interface WordFilterOptions {
	category?: WordCategoryType;
	difficulty?: WordDifficultyType;
}

export interface IWordRepository {
	getAll(): readonly WordDefinition[];
	filter(options: WordFilterOptions): readonly WordDefinition[];
	getRandomDefinition(options?: WordFilterOptions): WordDefinition | null;
	getRandomTargetWord(options?: WordFilterOptions): Result<TargetWord, Error>;
	loadCategories(categories: WordCategoryType[]): Promise<void>;
	isLoaded(): boolean;
}

export class InMemoryWordRepository implements IWordRepository {
	private words: WordDefinition[] = [];
	private loadedCategories = new Set<WordCategoryType>();

	public isLoaded(): boolean {
		return this.loadedCategories.size > 0;
	}

	public async loadCategories(categories: WordCategoryType[]): Promise<void> {
		const fetchPromises = categories.map(async (category) => {
			if (this.loadedCategories.has(category)) return;

			try {
				const res = await fetch(`/data/words/${category}.json`);
				if (!res.ok) {
					throw new Error(
						`Failed to fetch ${category}.json: ${res.statusText}`,
					);
				}
				const data = (await res.json()) as WordDefinition[];
				this.words.push(...data);
				this.loadedCategories.add(category);
			} catch (e) {
				console.error(`Error loading category ${category}:`, e);
			}
		});

		await Promise.all(fetchPromises);
	}

	public getAll(): readonly WordDefinition[] {
		return this.words;
	}

	public filter(options: WordFilterOptions): readonly WordDefinition[] {
		return this.words.filter((item) => {
			if (options.category && item.category !== options.category) {
				return false;
			}
			if (options.difficulty && item.difficulty !== options.difficulty) {
				return false;
			}
			return true;
		});
	}

	public getRandomDefinition(
		options: WordFilterOptions = {},
	): WordDefinition | null {
		const candidates = this.filter(options);
		if (candidates.length === 0) {
			return null;
		}
		const index = Math.floor(Math.random() * candidates.length);
		return candidates[index];
	}

	public getRandomTargetWord(
		options: WordFilterOptions = {},
	): Result<TargetWord, Error> {
		const def = this.getRandomDefinition(options);
		if (!def) {
			return Result.err(
				new Error("条件に合致する単語が見つかりませんでした。"),
			);
		}
		const targetResult = TargetWord.create(def.word, [...def.readings]);
		if (!targetResult.success) {
			return Result.err(targetResult.error);
		}
		return Result.ok(targetResult.value);
	}

	/** テスト用に強制的に単語をセットするメソッド */
	public __setWordsForTesting(words: WordDefinition[]) {
		this.words = [...words];
		this.loadedCategories.add(words[0]?.category || "it_errors");
	}
}

// シングルトンインスタンスの公開
export const wordRepository = new InMemoryWordRepository();
