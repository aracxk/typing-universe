import { Result } from "../../../shared/core/Result";
import { TargetWord } from "../domain/TargetWord";
import type { WordCategoryType } from "../domain/WordCategory";
import type { WordDefinition } from "../domain/WordDefinition";
import type { WordDifficultyType } from "../domain/WordDifficulty";

/**
 * 単語抽出時の絞り込み条件オプション。
 */
export interface WordFilterOptions {
	/** 抽出対象のカテゴリ（未指定時は全カテゴリ） */
	category?: WordCategoryType;
	/** 抽出対象の難易度（未指定時は全難易度） */
	difficulty?: WordDifficultyType;
}

/**
 * 単語データの取得と検索を担当するリポジトリインターフェース。
 */
export interface IWordRepository {
	/**
	 * ロード済みの全単語定義を取得します。
	 */
	getAll(): readonly WordDefinition[];

	/**
	 * 条件（カテゴリ、難易度）に一致する単語定義を抽出します。
	 *
	 * @param options 絞り込みオプション
	 */
	filter(options: WordFilterOptions): readonly WordDefinition[];

	/**
	 * 条件に一致する単語定義の中からランダムに1件取得します。
	 *
	 * @param options 絞り込みオプション
	 * @returns 一致する単語がある場合は WordDefinition、存在しない場合は null
	 */
	getRandomDefinition(options?: WordFilterOptions): WordDefinition | null;

	/**
	 * 条件に一致する単語定義からランダムに1件選択し、TargetWord を生成して返します。
	 *
	 * @param options 絞り込みオプション
	 * @returns 生成成功時は TargetWord、一致する単語がない場合は Error
	 */
	getRandomTargetWord(options?: WordFilterOptions): Result<TargetWord, Error>;

	/**
	 * 指定したカテゴリの単語JSONファイルを非同期ロードし、内部キャッシュに追加します。
	 *
	 * @param categories ロード対象のカテゴリ配列
	 */
	loadCategories(categories: WordCategoryType[]): Promise<void>;

	/**
	 * 1つ以上のカテゴリが既にロード完了しているかを判定します。
	 */
	isLoaded(): boolean;
}

/**
 * インメモリキャッシュを用いて単語データを管理するリポジトリ実装。
 */
export class InMemoryWordRepository implements IWordRepository {
	private words: WordDefinition[] = [];
	private loadedCategories = new Set<WordCategoryType>();

	/**
	 * 単語データがロード済みかどうかを判定します。
	 */
	public isLoaded(): boolean {
		return this.loadedCategories.size > 0;
	}

	/**
	 * 指定されたカテゴリのJSONデータを `/data/words/{category}.json` から取得してキャッシュします。
	 * 既にロード済みのカテゴリはスキップされます。
	 *
	 * @param categories 読み込むカテゴリリスト
	 */
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

	/**
	 * ロード済みの全単語定義のリストを取得します。
	 */
	public getAll(): readonly WordDefinition[] {
		return this.words;
	}

	/**
	 * カテゴリや難易度で単語を絞り込みます。
	 *
	 * @param options 絞り込み条件（category, difficulty）
	 */
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

	/**
	 * 絞り込み条件に一致する単語定義からランダムに1件取得します。
	 *
	 * @param options 絞り込み条件
	 * @returns 単語定義、または該当なしの場合 null
	 */
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

	/**
	 * 絞り込み条件に一致する単語からランダムに1件選択し、TargetWord 値オブジェクトとして返します。
	 *
	 * @param options 絞り込み条件
	 * @returns 成功時は TargetWord、単語が見つからない場合はエラー
	 */
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

	/**
	 * テスト用に強制的に単語リストをインジェクトします（テスト環境専用）。
	 *
	 * @param words テスト用単語定義リスト
	 */
	public __setWordsForTesting(words: WordDefinition[]) {
		this.words = [...words];
		this.loadedCategories.add(words[0]?.category || "it_errors");
	}
}

// シングルトンインスタンスの公開
export const wordRepository = new InMemoryWordRepository();
