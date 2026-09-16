import { Result } from "../../../shared/core/Result";
import { MASTER_WORDS } from "../data/words";
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
}

export class InMemoryWordRepository implements IWordRepository {
	private readonly words: readonly WordDefinition[];

	constructor(words: readonly WordDefinition[] = MASTER_WORDS) {
		this.words = words;
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
}

// シングルトンインスタンスの公開
export const wordRepository = new InMemoryWordRepository();
