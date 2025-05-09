document.addEventListener('DOMContentLoaded', function() {
  // 현재 활성화된 탭에서 사용자 아이디 가져오기
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getUserIds'}, function(response) {
      if (response && response.userIds) {
        displayUserIds(response.userIds);
      }
    });
  });

  // 자동 클릭 버튼 추가
  const header = document.querySelector('h2');
  const autoClickButton = document.createElement('button');
  autoClickButton.textContent = '첫 번째 게시물 자동 클릭';
  autoClickButton.style.cssText = `
    margin-left: 10px;
    padding: 4px 8px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  autoClickButton.onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'clickFirstUser'}, function(response) {
        if (response && response.success) {
          autoClickButton.textContent = '클릭 완료!';
          setTimeout(() => {
            autoClickButton.textContent = '첫 번째 게시물 자동 클릭';
          }, 1000);
        }
      });
    });
  };
  header.appendChild(autoClickButton);
});

function displayUserIds(userIds) {
  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  userIds.forEach(userId => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    
    const userIdSpan = document.createElement('span');
    userIdSpan.textContent = '@' + userId;
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.textContent = '복사';
    copyButton.onclick = () => {
      navigator.clipboard.writeText('@' + userId).then(() => {
        copyButton.textContent = '복사됨!';
        setTimeout(() => {
          copyButton.textContent = '복사';
        }, 1000);
      });
    };

    userItem.appendChild(userIdSpan);
    userItem.appendChild(copyButton);
    userList.appendChild(userItem);
  });
} 