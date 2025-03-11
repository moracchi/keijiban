// DOMの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const messageForm = document.getElementById('message-form');
    const nicknameInput = document.getElementById('nickname');
    const commentInput = document.getElementById('comment');
    const messageList = document.getElementById('message-list');
    const clearAllButton = document.getElementById('clear-all-button');
    
    // ページ読み込み時にメッセージを表示
    displayMessages();
    
    // フォーム送信イベント
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 入力値を取得
        const nickname = nicknameInput.value.trim();
        const comment = commentInput.value.trim();
        
        // 入力チェック
        if (!nickname || !comment) {
            alert('ニックネームとメッセージを入力してください');
            return;
        }
        
        // 現在の日時を取得
        const now = new Date();
        const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // メッセージオブジェクトを作成
        const messageObj = {
            id: Date.now(), // ユニークIDを追加
            nickname: nickname,
            comment: comment,
            date: dateStr
        };
        
        // メッセージを保存
        saveMessage(messageObj);
        
        // チョーク音エフェクト（オプション）
        playChalkSound();
        
        // フォームをリセット
        messageForm.reset();
        
        // メッセージ一覧を更新
        displayMessages();
    });
    
    // すべて消すボタンのイベント
    if (clearAllButton) {
        clearAllButton.addEventListener('click', function() {
            if (confirm('すべてのメッセージを消去しますか？')) {
                deleteAllMessages();
            }
        });
    }
    
    // メッセージを保存する関数
    function saveMessage(messageObj) {
        // ローカルストレージからメッセージを取得
        let messages = JSON.parse(localStorage.getItem('stationMessages')) || [];
        
        // 新しいメッセージを先頭に追加
        messages.unshift(messageObj);
        
        // メッセージ数を制限（最大50件）
        if (messages.length > 50) {
            messages = messages.slice(0, 50);
        }
        
        // ローカルストレージに保存
        localStorage.setItem('stationMessages', JSON.stringify(messages));
    }
    
    // メッセージを表示する関数
    function displayMessages() {
        // ローカルストレージからメッセージを取得
        const messages = JSON.parse(localStorage.getItem('stationMessages')) || [];
        
        // メッセージリストをクリア
        messageList.innerHTML = '';
        
        // メッセージがない場合
        if (messages.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'まだメッセージがありません。最初のメッセージを書き込んでみましょう！';
            messageList.appendChild(emptyMessage);
            return;
        }
        
        // 各メッセージを表示
        messages.forEach(function(msg) {
            // メッセージ要素を作成
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            messageEl.dataset.id = msg.id; // メッセージIDを設定
            
            // XSS対策のためにテキストをエスケープする関数
            function escapeHTML(str) {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }
            
            // メッセージのHTMLを設定（エスケープ処理を行う）
            messageEl.innerHTML = `
                <div class="message-header">
                    <span class="message-nickname">${escapeHTML(msg.nickname)}</span>
                    <span class="message-date">${escapeHTML(msg.date)}</span>
                </div>
                <div class="message-content">${escapeHTML(msg.comment).replace(/\n/g, '<br>')}</div>
                <button class="eraser-button" title="このメッセージを消す"></button>
            `;
            
            // メッセージリストに追加
            messageList.appendChild(messageEl);
            
            // ランダムな角度を適用（手書き感を出す）
            applyRandomTilt(messageEl);
        });
        
        // 黒板消しボタンのイベントを設定
        setupEraserButtons();
    }
    
    // 黒板消しボタンのイベント設定
    function setupEraserButtons() {
        const eraserButtons = document.querySelectorAll('.eraser-button');
        
        eraserButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // イベントの伝播を止める
                e.stopPropagation();
                
                // メッセージ要素を取得
                const messageEl = this.closest('.message');
                const messageId = messageEl.dataset.id;
                
                // 消去エフェクト
                createEraserEffect(messageEl);
                
                // メッセージを削除
                setTimeout(() => {
                    deleteMessage(messageId);
                }, 800);
            });
        });
    }
    
    // すべてのメッセージを削除する関数
    function deleteAllMessages() {
        // 一旦すべてのメッセージに消去エフェクトを適用
        const allMessages = document.querySelectorAll('.message');
        allMessages.forEach(msg => {
            createEraserEffect(msg);
        });
        
        // ローカルストレージをクリア
        setTimeout(() => {
            localStorage.removeItem('stationMessages');
            displayMessages(); // メッセージ一覧を更新
        }, 1000);
    }
    
    // メッセージ削除関数
    function deleteMessage(messageId) {
        // ローカルストレージからメッセージを取得
        let messages = JSON.parse(localStorage.getItem('stationMessages')) || [];
        
        // IDに一致するメッセージを削除
        messages = messages.filter(msg => msg.id != messageId);
        
        // ローカルストレージに保存
        localStorage.setItem('stationMessages', JSON.stringify(messages));
        
        // メッセージ一覧を更新
        displayMessages();
    }
    
    // 黒板消しエフェクト
    function createEraserEffect(messageEl) {
        // メッセージにエフェクトクラスを追加
        messageEl.style.transition = 'opacity 0.8s ease-out';
        messageEl.style.opacity = '0.1';
        
        // 黒板消し粉のエフェクト
        const eraserButton = messageEl.querySelector('.eraser-button');
        if (eraserButton) {
            const buttonRect = eraserButton.getBoundingClientRect();
            
            // 複数のチョーク粉を作成
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const dust = document.createElement('div');
                    dust.className = 'chalk-dust';
                    
                    // 位置を設定
                    dust.style.left = (buttonRect.left + Math.random() * buttonRect.width - 20) + 'px';
                    dust.style.top = (buttonRect.top + Math.random() * buttonRect.height - 10) + 'px';
                    
                    // bodyに追加
                    document.body.appendChild(dust);
                    
                    // アニメーション終了後に要素を削除
                    setTimeout(() => {
                        dust.remove();
                    }, 1000);
                }, i * 100);
            }
        }
    }
    
    // チョーク音を再生（オプション）
    function playChalkSound() {
        // 将来的に音声を追加する場合はここに実装
    }
    
    // ランダムな角度を適用（手書き感を出す）
    function applyRandomTilt(element) {
        // -1°から1°の間でランダムな角度を設定
        const randomTilt = (Math.random() * 2 - 1) * 0.8;
        element.style.transform = `rotate(${randomTilt}deg)`;
    }
    
    // レトロなビジュアル効果の追加
    function addRetroEffects() {
        // チョーク跡の追加
        const chalkMarks = document.createElement('div');
        chalkMarks.className = 'chalk-marks';
        document.querySelector('.blackboard').appendChild(chalkMarks);
        
        // ランダムなチョーク跡を描画
        for (let i = 0; i < 20; i++) {
            const mark = document.createElement('div');
            mark.style.position = 'absolute';
            mark.style.width = (Math.random() * 30 + 10) + 'px';
            mark.style.height = (Math.random() * 4 + 1) + 'px';
            mark.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            mark.style.borderRadius = '2px';
            mark.style.transform = `rotate(${Math.random() * 360}deg)`;
            mark.style.left = (Math.random() * 100) + '%';
            mark.style.top = (Math.random() * 100) + '%';
            chalkMarks.appendChild(mark);
        }
    }
    
    // レトロエフェクトの適用
    addRetroEffects();
});
