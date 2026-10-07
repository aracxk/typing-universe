import { onDisconnect, onValue, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import { rtdb } from "../client";

/**
 * Realtime Database を用いて、現在のサイト全体のオンライン人数を管理・取得するフック。
 * タブを開いた時にセッションIDを発行し、切断時(onDisconnect)に自動削除される。
 */
export function usePresence() {
	const [activeUsers, setActiveUsers] = useState<number>(0);

	useEffect(() => {
		// 簡易的な一意のセッションIDを生成（crypto.randomUUIDは安全なコンテキストでのみ動作）
		const sessionId =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: Math.random().toString(36).substring(2, 15);

		const userStatusRef = ref(rtdb, `presence/${sessionId}`);
		const presenceRef = ref(rtdb, "presence");

		// Firebase側の接続状態を監視する特別なパス
		const connectedRef = ref(rtdb, ".info/connected");

		// 接続状態が true になったら、自身を presence ノードに登録する
		const unsubscribeConnected = onValue(connectedRef, (snap) => {
			if (snap.val() === true) {
				// 切断時に自動削除されるように予約
				onDisconnect(userStatusRef)
					.remove()
					.then(() => {
						// 予約が成功したらオンラインとして書き込む
						set(userStatusRef, true);
					});
			}
		});

		// presence ノード全体を監視して人数をカウントする
		const unsubscribePresence = onValue(presenceRef, (snapshot) => {
			if (snapshot.exists()) {
				// 登録されているキー（セッションID）の数を数える
				setActiveUsers(Object.keys(snapshot.val()).length);
			} else {
				setActiveUsers(0);
			}
		});

		// クリーンアップ（コンポーネントのアンマウント時に自身を明示的に削除）
		return () => {
			unsubscribeConnected();
			unsubscribePresence();
			remove(userStatusRef);
		};
	}, []);

	return { activeUsers };
}
