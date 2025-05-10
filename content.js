function extractUserIds() {
  const userIds = new Set();
  const links = document.querySelectorAll('a[href^="/@"]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/@')) {
      const userId = href.substring(2); // '@' 제거
      userIds.add(userId);
    }
  });

  return Array.from(userIds);
}

function clickFirstUserContent() {
  // 첫 번째 사용자 아이디 링크 찾기
  const firstUserLink = document.querySelector('a[href^="/@"]');
  if (firstUserLink) {
    // 해당 사용자의 게시물 컨테이너 찾기
    const userContainer = firstUserLink.closest('.x78zum5');
    if (userContainer) {
      // 게시물 내용을 포함하는 div 찾기
      const contentDiv = userContainer.querySelector('.x1a6qonq.x6ikm8r.x10wlt62');
      if (contentDiv) {
        console.log('클릭할 요소 찾음:', contentDiv);
        contentDiv.click();
      }
    }
  }
}

// 자동 이동 상태 관리
let isAutoNavigateEnabled = false;
let currentIndex = 0;
let postLinks = [];

// 우측 상단 알림(Toast) 표시 함수
function showToast(message) {
  const existingToast = document.getElementById('custom-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'custom-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 30px;
    right: 30px;
    background: #323232;
    color: #fff;
    padding: 16px 32px;
    border-radius: 8px;
    font-size: 16px;
    z-index: 1000000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    opacity: 0.95;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), CONFIG.UI.TOAST_DURATION);
  }, 2000);
}

// 리포스트 버튼을 정확히 찾는 함수
function findRepostButton(extraClass = "") {
  const selector = `div[role="button"]${extraClass}`;
  const buttons = document.querySelectorAll(selector);
  for (const btn of buttons) {
    const repostSvg = btn.querySelector('svg[aria-label="리포스트"]');
    if (repostSvg) {
      // 이미 리포스트된 경우 path d 속성 체크
      const alreadyReposted = repostSvg.querySelector('path[d="m11.733 7.2-3.6 3.6L6.27 8.937"]');
      if (!alreadyReposted) {
        return btn;
      }
    }
  }
  return null;
}

// 포스트 페이지에서 좋아요, 리포스트, 두번째 리포스트 버튼 자동 클릭 및 알림
function autoClickLikeAndRepostWithNotify() {
  // 포스트 페이지인지 확인 (URL에 /post/ 포함)
  if (!window.location.pathname.includes('/post/')) return;

  // 1. 현재 페이지 주소에서 아이디 추출
  const match = window.location.pathname.match(/^\/(@[\w.\-]+)\/post\//);
  if (!match) return;
  const pageOwnerId = match[1].replace('@', '');

  // 2. 게시글 작성자 아이디 추출
  const userLink = document.querySelector('.x1a2a7pz.x1n2onr6 a[href^="/@"]');
  if (!userLink) return;
  const authorHref = userLink.getAttribute('href');
  const authorId = authorHref.replace('/@', '');

  // 3. 동일하지 않으면 리포스트 실행하지 않음
  if (pageOwnerId !== authorId) {
    console.log('페이지 주소와 게시글 작성자가 다르므로 리포스트를 실행하지 않습니다.');
    return;
  }

  // 1. 0.5초 후 좋아요 버튼 클릭
  setTimeout(() => {
    const likeBtn = document.querySelector('div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x139jcc6[role="button"]');
    if (likeBtn) {
      // 좋아요 버튼 내부에 aria-label이 '좋아요 취소'인 svg가 있으면 이미 눌린 상태
      const likedSvg = likeBtn.querySelector('svg[aria-label="좋아요 취소"]');
      if (!likedSvg) {
        likeBtn.click();
        showToast('좋아요 버튼이 자동으로 눌렸습니다!');
        console.log('좋아요 버튼 자동 클릭 완료');
      } else {
        console.log('이미 좋아요가 눌린 상태입니다.');
      }
    }
    
    // 2. 0.5초 후 리포스트 버튼 클릭
    setTimeout(() => {
      // 리포스트 버튼 찾기 (여러 선택자 시도)
      const repostBtn = document.querySelector('div[role="button"] svg[aria-label="리포스트"]')?.closest('div[role="button"]') ||
                       document.querySelector('div[role="button"] svg[aria-label="Repost"]')?.closest('div[role="button"]') ||
                       document.querySelector('div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz[role="button"]') ||
                       Array.from(document.querySelectorAll('div[role="button"]')).find(btn => {
                         const svg = btn.querySelector('svg[aria-label="리포스트"], svg[aria-label="Repost"]');
                         return svg !== null;
                       });

      if (repostBtn) {
        // 버튼이 보이도록 스크롤
        repostBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 클릭 전 잠시 대기
        setTimeout(() => {
          // 마우스 이벤트 시뮬레이션
          ['mouseover', 'mouseenter', 'mousemove'].forEach(type => {
            const event = new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window
            });
            repostBtn.dispatchEvent(event);
          });

          // 클릭 이벤트 발생
          repostBtn.click();
          showToast('리포스트 버튼이 자동으로 눌렸습니다!');
          console.log('리포스트 버튼 자동 클릭 완료');
          
          // 1.5초 후 두 번째 리포스트 버튼 클릭
          setTimeout(() => {
            // 리포스트 팝업 찾기 (여러 선택자 시도)
            const popup = document.querySelector('div[role="dialog"]') ||
                         document.querySelector('div[role="menu"]') ||
                         Array.from(document.querySelectorAll('div[role="dialog"], div[role="menu"]')).find(dialog => {
                           // 팝업 내부의 모든 버튼 확인
                           const buttons = dialog.querySelectorAll('div[role="button"]');
                           return Array.from(buttons).some(btn => {
                             // 버튼의 텍스트나 SVG 라벨 확인
                             const text = btn.textContent.trim();
                             const svg = btn.querySelector('svg[aria-label="리포스트"], svg[aria-label="Repost"]');
                             const span = btn.querySelector('span');
                             return (text === '리포스트' || text === 'Repost') || 
                                    svg !== null || 
                                    (span && (span.textContent.trim() === '리포스트' || span.textContent.trim() === 'Repost'));
                           });
                         });

            if (popup) {
              console.log('리포스트 팝업 찾음');
              const buttons = popup.querySelectorAll('div[role="button"]');
              const secondRepostBtn = Array.from(buttons).find(btn => {
                // 버튼의 모든 가능한 텍스트 소스 확인
                const text = btn.textContent.trim();
                const svg = btn.querySelector('svg[aria-label="리포스트"], svg[aria-label="Repost"]');
                const span = btn.querySelector('span');
                return (text === '리포스트' || text === 'Repost') || 
                       svg !== null || 
                       (span && (span.textContent.trim() === '리포스트' || span.textContent.trim() === 'Repost'));
              });
              
              if (secondRepostBtn) {
                console.log('리포스트 버튼 찾음:', secondRepostBtn);
                // 버튼이 보이도록 스크롤
                secondRepostBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 클릭 전 잠시 대기
                setTimeout(() => {
                  // 마우스 이벤트 시뮬레이션
                  /*['mouseover', 'mouseenter', 'mousemove'].forEach(type => {
                    const event = new MouseEvent(type, {
                      bubbles: true,
                      cancelable: true,
                      view: window
                    });
                    secondRepostBtn.dispatchEvent(event);
                  });*/

                  // 클릭 이벤트 발생
                  secondRepostBtn.click();
                  showToast('두 번째 리포스트 버튼이 클릭되었습니다!');
                  console.log('두 번째 리포스트 버튼 클릭 완료');

                  // 1초 후 답글 작성 버튼 클릭
                  setTimeout(() => {
                    // 답글 작성 버튼 찾기 (여러 선택자 시도)
                    const replyBtn = document.querySelector('div[role="button"] svg[aria-label="답글"]')?.closest('div[role="button"]') ||
                                   document.querySelector('div[role="button"] svg[aria-label="Reply"]')?.closest('div[role="button"]') ||
                                   Array.from(document.querySelectorAll('div[role="button"]')).find(btn => {
                                     const text = btn.textContent.trim();
                                     return text === '답글' || text === 'Reply';
                                   });

                    if (replyBtn) {
                      // 버튼이 보이도록 스크롤
                      replyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      
                      // 클릭 전 잠시 대기
                      setTimeout(() => {
                        // 마우스 이벤트 시뮬레이션
                        ['mouseover', 'mouseenter', 'mousemove'].forEach(type => {
                          const event = new MouseEvent(type, {
                            bubbles: true,
                            cancelable: true,
                            view: window
                          });
                          replyBtn.dispatchEvent(event);
                        });

                        // 클릭 이벤트 발생
                        replyBtn.click();
                        console.log('답글 남기기 버튼 자동 클릭 완료');

                        // 답글 작성 폼이 생성될 때까지 대기
                        let observer2 = null;
                        observer2 = new MutationObserver((mutations, obs2) => {
                          const replyInput = document.querySelector('div[role="textbox"][data-lexical-editor="true"]');
                          if (replyInput) {
                            console.log('답글 작성 폼이 생성됨');
                            obs2.disconnect();
                            observer2 = null;
                            
                            // 답글 입력 시도
                            setTimeout(() => {
                              try {
                                // Lexical 에디터에 직접 텍스트 입력 시도
                                const editor = replyInput.__lexicalEditor;
                                if (editor) {
                                  editor.update(() => {
                                    const root = editor.getRootElement();
                                    const paragraph = document.createElement('p');
                                    paragraph.className = 'xdj266r x11i5rnm xat24cr x1mh8g0r';
                                    paragraph.dir = 'ltr';
                                    
                                    const span = document.createElement('span');
                                    span.setAttribute('data-lexical-text', 'true');
                                    // 댓글 변형 중 랜덤하게 선택
                                    const randomComment = CONFIG.COMMENTS.VARIANTS[Math.floor(Math.random() * CONFIG.COMMENTS.VARIANTS.length)];
                                    span.textContent = randomComment;
                                    
                                    paragraph.appendChild(span);
                                    root.appendChild(paragraph);
                                  });
                                  console.log('Lexical 에디터에 텍스트 입력 완료');
                                } else {
                                  // execCommand로 텍스트 입력 시도
                                  replyInput.focus();
                                  const randomComment = CONFIG.COMMENTS.VARIANTS[Math.floor(Math.random() * CONFIG.COMMENTS.VARIANTS.length)];
                                  const success = document.execCommand('insertText', false, randomComment);
                                  if (success) {
                                    console.log('execCommand로 텍스트 입력 성공');
                                  } else {
                                    console.log('execCommand 실패, 다른 방법 시도');
                                    // 클립보드를 통한 입력 시도
                                    navigator.clipboard.writeText(randomComment).then(() => {
                                      document.execCommand('paste');
                                      console.log('클립보드를 통한 텍스트 입력 시도');
                                    });
                                  }
                                }

                                // 게시 버튼 클릭
                                setTimeout(() => {
                                  const allButtons = document.querySelectorAll('div[role="button"]');
                                  const postBtn = Array.from(allButtons).find(btn => {
                                    const textDiv = btn.querySelector('div');
                                    return textDiv && (textDiv.textContent.trim() === '게시' || textDiv.textContent.trim() === 'Post');
                                  });
                                  
                                  if (postBtn) {
                                    postBtn.click();
                                    console.log('게시 버튼 자동 클릭 완료');
                                    // 1초 후 사용자 홈으로 이동
                                    setTimeout(() => {
                                      window.location.href = 'https://www.threads.com/@'+pageOwnerId+'?like=ok';
                                    }, 1000);
                                  } else {
                                    console.log('게시 버튼을 찾지 못했습니다.');
                                    // 디버깅을 위해 모든 버튼 출력
                                    allButtons.forEach(btn => {
                                      const textDiv = btn.querySelector('div');
                                      if (textDiv) {
                                        console.log('버튼 텍스트:', textDiv.textContent.trim());
                                      }
                                    });
                                  }
                                }, 1000);
                              } catch (e) {
                                console.error('답글 입력 중 오류:', e);
                              }
                            }, 1000);
                          }
                        });
                        observer2.observe(document.body, { childList: true, subtree: true });
                        // 5초 후 observer2 자동 해제 (메모리 누수 방지)
                        let observer2Timeout = setTimeout(() => {
                          if (observer2) {
                            observer2.disconnect();
                            observer2 = null;
                            console.log('답글 작성 폼 observer 타임아웃으로 해제');
                          }
                          clearTimeout(observer2Timeout);
                        }, 5000);
                      }, 500);
                    } else {
                      console.log('답글 남기기 버튼을 찾지 못했습니다.');
                    }
                  }, 1000);
                }, 500);
              } else {
                console.log('두 번째 리포스트 버튼을 찾지 못했습니다.');
                // 디버깅을 위해 모든 버튼 출력
                buttons.forEach(btn => {
                  const span = btn.querySelector('span');
                  if (span) {
                    console.log('팝업 버튼 텍스트:', span.textContent.trim());
                  }
                });
              }
            } else {
              console.log('리포스트 팝업을 찾지 못했습니다.');
              // 디버깅을 위해 모든 dialog 요소 출력
              const allDialogs = document.querySelectorAll('div[role="dialog"]');
              console.log('찾은 모든 dialog 요소:', allDialogs.length);
              allDialogs.forEach(dialog => {
                console.log('Dialog 내용:', dialog.innerHTML);
              });
            }
          }, 1500);
        }, 500);
      } else {
        console.log('리포스트 버튼을 찾지 못했습니다.');
        // 디버깅을 위해 모든 버튼 출력
        const allButtons = document.querySelectorAll('div[role="button"]');
        allButtons.forEach(btn => {
          console.log('버튼 텍스트:', btn.textContent.trim());
          console.log('버튼 aria-label:', btn.getAttribute('aria-label'));
        });
      }
    }, 500);
  }, 500);
}

// 로컬 스토리지에서 팔로우한 사용자 목록 가져오기
function getFollowedUsers() {
  const profileLink = document.querySelector('a[href^="/@"]');
  if (!profileLink) return [];
  
  const userId = profileLink.getAttribute('href').replace('/@', '');
  const followedUsers = localStorage.getItem(`followedUsers_${userId}`);
  return followedUsers ? JSON.parse(followedUsers) : [];
}

// 로컬 스토리지에 팔로우한 사용자 추가
function addFollowedUser(userId) {
  const profileLink = document.querySelector('a[href^="/@"]');
  if (!profileLink) return;
  
  const currentUserId = profileLink.getAttribute('href').replace('/@', '');
  const followedUsers = getFollowedUsers();
  if (!followedUsers.includes(userId)) {
    followedUsers.push(userId);
    localStorage.setItem(`followedUsers_${currentUserId}`, JSON.stringify(followedUsers));
  }
}

  // URL에서 검색어 가져오기
  function getSearchKeywordFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('q');
    return keyword ? decodeURIComponent(keyword) : null;
  }

  // 로컬 스토리지에서 검색 키워드 가져오기
  function getSavedSearchKeyword() {
    const profileLink = document.querySelector('a[href^="/@"]');
    if (!profileLink) return CONFIG.SEARCH.KEYWORD;
    
    const userId = profileLink.getAttribute('href').replace('/@', '');
    const savedKeyword = localStorage.getItem(`searchKeyword_${userId}`);
    return savedKeyword || CONFIG.SEARCH.KEYWORD;
  }

  // 검색 키워드 저장
  function saveSearchKeyword(keyword) {
    const profileLink = document.querySelector('a[href^="/@"]');
    if (!profileLink) return;
    
    const userId = profileLink.getAttribute('href').replace('/@', '');
    localStorage.setItem(`searchKeyword_${userId}`, keyword);
  }

// 게시물 링크 리스트 표시 함수
function displayPostLinks() {
  // 현재 URL이 검색 페이지인지 확인
  if (!window.location.href.includes('threads.com/search')) {
    // 메인 페이지, 활동 페이지, 사용자 홈페이지인 경우 검색창만 표시
    if (window.location.href === 'https://www.threads.com/' || 
        window.location.href === 'https://www.threads.com/activity' ||
        window.location.href.match(/^https:\/\/www\.threads\.com\/@[\w.\-]+$/)) {
      displaySearchBarOnly();
      return;
    }
    
    // 사용자 홈페이지인 경우
    if (window.location.href.includes('threads.com/@')) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('like') === 'ok') {
        // 저장된 게시물 리스트 가져오기
        const savedPosts = localStorage.getItem('savedPosts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          if (posts.length > 0) {
            displaySavedPosts(posts);
            return;
          }
        }
      }
    }
    // 검색 페이지가 아니면 아무것도 표시하지 않음
    const existingContainer = document.getElementById('post-links-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    return;
  }

  // 검색 페이지인 경우 여러 번 시도
  let attempts = 0;
  const maxAttempts = 5;
  const attemptInterval = 1000; // 1초 간격

  function tryDisplayLinks() {
    attempts++;
    console.log(`게시물 링크 목록 표시 시도 ${attempts}/${maxAttempts}`);

    // 기존 리스트 컨테이너 제거
    const existingContainer = document.getElementById('post-links-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 모든 게시물 링크 찾기
    postLinks = Array.from(document.querySelectorAll('a[href*="/post/"]'));
    if (postLinks.length === 0) {
      console.log('검색 결과에서 게시물 링크를 찾을 수 없습니다.');
      if (attempts < maxAttempts) {
        setTimeout(tryDisplayLinks, attemptInterval);
      }
      return;
    }

    // 팔로우한 사용자 목록 가져오기
    const followedUsers = getFollowedUsers();

    // 게시물 링크 저장 (중복 제거 및 이미 팔로우한 사용자 제외)
    const uniquePosts = new Map();
    postLinks.forEach(link => {
      const href = link.getAttribute('href');
      const match = href.match(/\/(@[\w.\-]+)/);
      if (match) {
        const userId = match[1].replace('@', '');
        // 이미 팔로우한 사용자는 제외
        if (!followedUsers.includes(userId) && !uniquePosts.has(userId)) {
          uniquePosts.set(userId, {
            href: href,
            userId: userId
          });
        }
      }
    });
    const posts = Array.from(uniquePosts.values());
    localStorage.setItem('savedPosts', JSON.stringify(posts));

    // 리스트 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'post-links-container';
    container.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      width: ${CONFIG.UI.LIST_WIDTH}px;
      max-height: ${CONFIG.UI.LIST_MAX_HEIGHT};
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 999999;
      font-family: Arial, sans-serif;
    `;

    // 프로필 정보 표시
    const profileContainer = createProfileInfo();
    if (profileContainer) {
      container.appendChild(profileContainer);
    }

    // 제목과 컨트롤 버튼 컨테이너
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    `;

    // 검색창 컨테이너
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '검색어를 입력하세요';
    
    // URL의 검색어와 저장된 검색어 비교
    const urlKeyword = getSearchKeywordFromUrl();
    const savedKeyword = getSavedSearchKeyword();
    
    if (urlKeyword && urlKeyword !== savedKeyword) {
      searchInput.value = urlKeyword;
      saveSearchKeyword(urlKeyword);
    } else {
      searchInput.value = savedKeyword;
    }

    searchInput.style.cssText = `
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      width: 116px;
    `;

    const searchButton = document.createElement('button');
    searchButton.textContent = '검색';
    searchButton.style.cssText = `
      padding: 8px 16px;
      background-color: #0095f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background-color 0.2s;
    `;
    searchButton.onmouseover = () => {
      searchButton.style.backgroundColor = '#0081d6';
    };
    searchButton.onmouseout = () => {
      searchButton.style.backgroundColor = '#0095f6';
    };

    // 검색 기능 구현
    const performSearch = () => {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        saveSearchKeyword(searchTerm);
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const searchUrl = `https://www.threads.com/search?q=${encodedSearchTerm}&serp_type=default`;
        window.location.href = searchUrl;
      }
    };

    searchButton.onclick = performSearch;
    searchInput.onkeyup = (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    };

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    headerContainer.appendChild(searchContainer);

    // 제목과 컨트롤 버튼 컨테이너
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    `;

    const title = document.createElement('h3');
    title.innerHTML = `게시물 링크 목록<br>(팔로우: ${followedUsers.length}명, 남은 게시물: ${posts.length}개)`;
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      color: #262626;
    `;

    const controlContainer = document.createElement('div');
    controlContainer.style.cssText = `
      display: flex;
      gap: 8px;
    `;

    const startButton = document.createElement('button');
    startButton.textContent = '시작';
    startButton.style.cssText = `
      padding: 6px 12px;
      background-color: #0095f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      transition: background-color 0.2s;
    `;
    startButton.onmouseover = () => {
      startButton.style.backgroundColor = '#0081d6';
    };
    startButton.onmouseout = () => {
      startButton.style.backgroundColor = '#0095f6';
    };
    startButton.onclick = () => {
      isAutoNavigateEnabled = true;
      currentIndex = 0;
      if (posts.length > 0) {
        window.location.href = posts[0].href;
      } else {
        alert('팔로우할 게시물이 없습니다.');
      }
    };

    const stopButton = document.createElement('button');
    stopButton.textContent = '중지';
    stopButton.style.cssText = `
      padding: 6px 12px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      transition: background-color 0.2s;
    `;
    stopButton.onmouseover = () => {
      stopButton.style.backgroundColor = '#c82333';
    };
    stopButton.onmouseout = () => {
      stopButton.style.backgroundColor = '#dc3545';
    };
    stopButton.onclick = () => {
      isAutoNavigateEnabled = false;
    };

    controlContainer.appendChild(startButton);
    controlContainer.appendChild(stopButton);
    titleContainer.appendChild(title);
    titleContainer.appendChild(controlContainer);
    headerContainer.appendChild(titleContainer);

    // 링크 리스트 생성
    const list = document.createElement('ul');
    list.style.cssText = `
      list-style: none;
      padding: 0;
      margin: 0;
    `;

    posts.forEach((post, index) => {
      const listItem = document.createElement('li');
      listItem.style.cssText = `
        padding: 8px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s;
      `;
      listItem.onmouseover = () => {
        listItem.style.backgroundColor = '#f8f9fa';
      };
      listItem.onmouseout = () => {
        listItem.style.backgroundColor = 'white';
      };

      const linkText = document.createElement('span');
      linkText.textContent = post.userId || `게시물 ${index + 1}`;
      linkText.style.cssText = `
        flex: 1;
        margin-right: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #262626;
      `;

      const moveButton = document.createElement('button');
      moveButton.textContent = '이동';
      moveButton.style.cssText = `
        padding: 4px 8px;
        background-color: #0095f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      `;
      moveButton.onmouseover = () => {
        moveButton.style.backgroundColor = '#0081d6';
      };
      moveButton.onmouseout = () => {
        moveButton.style.backgroundColor = '#0095f6';
      };
      moveButton.onclick = () => {
        window.location.href = post.href;
      };

      listItem.appendChild(linkText);
      listItem.appendChild(moveButton);
      list.appendChild(listItem);
    });

    container.appendChild(headerContainer);
    container.appendChild(list);
    document.body.appendChild(container);
  }

  // 첫 시도 시작
  tryDisplayLinks();
}

// 저장된 게시물 리스트 표시 함수
function displaySavedPosts(posts) {
  // 기존 리스트 컨테이너 제거
  const existingContainer = document.getElementById('post-links-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // 팔로우한 사용자 목록 가져오기
  const followedUsers = getFollowedUsers();

  // 리스트 컨테이너 생성
  const container = document.createElement('div');
  container.id = 'post-links-container';
  container.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    width: ${CONFIG.UI.LIST_WIDTH}px;
    max-height: ${CONFIG.UI.LIST_MAX_HEIGHT};
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;

  // 프로필 정보 표시
  const profileContainer = createProfileInfo();
  if (profileContainer) {
    container.appendChild(profileContainer);
  }

  // 제목과 컨트롤 버튼 컨테이너
  const headerContainer = document.createElement('div');
  headerContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  `;

  // 검색창 컨테이너
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    display: flex;
    gap: 8px;
    align-items: center;
  `;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '검색어를 입력하세요';
  
  // URL의 검색어와 저장된 검색어 비교
  const urlKeyword = getSearchKeywordFromUrl();
  const savedKeyword = getSavedSearchKeyword();
  
  if (urlKeyword && urlKeyword !== savedKeyword) {
    searchInput.value = urlKeyword;
    saveSearchKeyword(urlKeyword);
  } else {
    searchInput.value = savedKeyword;
  }

  searchInput.style.cssText = `
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 116px;
  `;

  const searchButton = document.createElement('button');
  searchButton.textContent = '검색';
  searchButton.style.cssText = `
    padding: 8px 16px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  `;
  searchButton.onmouseover = () => {
    searchButton.style.backgroundColor = '#0081d6';
  };
  searchButton.onmouseout = () => {
    searchButton.style.backgroundColor = '#0095f6';
  };

  // 검색 기능 구현
  const performSearch = () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      saveSearchKeyword(searchTerm);
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const searchUrl = `https://www.threads.com/search?q=${encodedSearchTerm}&serp_type=default`;
      window.location.href = searchUrl;
    }
  };

  searchButton.onclick = performSearch;
  searchInput.onkeyup = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchButton);
  headerContainer.appendChild(searchContainer);

  // 제목과 컨트롤 버튼 컨테이너
  const titleContainer = document.createElement('div');
  titleContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  `;

  const title = document.createElement('h3');
  title.innerHTML = `게시물 링크 목록<br>(팔로우: ${followedUsers.length}명, 남은 게시물: ${posts.length}개)`;
  title.style.cssText = `
    margin: 0;
    font-size: 16px;
    color: #262626;
  `;

  const controlContainer = document.createElement('div');
  controlContainer.style.cssText = `
    display: flex;
    gap: 8px;
  `;

  const startButton = document.createElement('button');
  startButton.textContent = '시작';
  startButton.style.cssText = `
    padding: 6px 12px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: background-color 0.2s;
  `;
  startButton.onmouseover = () => {
    startButton.style.backgroundColor = '#0081d6';
  };
  startButton.onmouseout = () => {
    startButton.style.backgroundColor = '#0095f6';
  };
  startButton.onclick = () => {
    isAutoNavigateEnabled = true;
    currentIndex = 0;
    if (posts.length > 0) {
      window.location.href = posts[0].href;
    } else {
      alert('팔로우할 게시물이 없습니다.');
    }
  };

  const stopButton = document.createElement('button');
  stopButton.textContent = '중지';
  stopButton.style.cssText = `
    padding: 6px 12px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: background-color 0.2s;
  `;
  stopButton.onmouseover = () => {
    stopButton.style.backgroundColor = '#c82333';
  };
  stopButton.onmouseout = () => {
    stopButton.style.backgroundColor = '#dc3545';
  };
  stopButton.onclick = () => {
    isAutoNavigateEnabled = false;
  };

  controlContainer.appendChild(startButton);
  controlContainer.appendChild(stopButton);
  titleContainer.appendChild(title);
  titleContainer.appendChild(controlContainer);
  headerContainer.appendChild(titleContainer);

  // 링크 리스트 생성
  const list = document.createElement('ul');
  list.style.cssText = `
    list-style: none;
    padding: 0;
    margin: 0;
  `;

  posts.forEach((post, index) => {
    const listItem = document.createElement('li');
    listItem.style.cssText = `
      padding: 8px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.2s;
      ${followedUsers.includes(post.userId) ? 'background-color: #e8f5e9;' : ''}
      ${post.href === window.location.pathname ? 'border-left: 4px solid #0095f6;' : ''}
    `;
    listItem.onmouseover = () => {
      listItem.style.backgroundColor = followedUsers.includes(post.userId) ? '#c8e6c9' : '#f8f9fa';
    };
    listItem.onmouseout = () => {
      listItem.style.backgroundColor = followedUsers.includes(post.userId) ? '#e8f5e9' : 'white';
    };

    const linkText = document.createElement('span');
    linkText.textContent = post.userId || `게시물 ${index + 1}`;
    linkText.style.cssText = `
      flex: 1;
      margin-right: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #262626;
    `;

    const moveButton = document.createElement('button');
    moveButton.textContent = '이동';
    moveButton.style.cssText = `
      padding: 4px 8px;
      background-color: #0095f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;
    `;
    moveButton.onmouseover = () => {
      moveButton.style.backgroundColor = '#0081d6';
    };
    moveButton.onmouseout = () => {
      moveButton.style.backgroundColor = '#0095f6';
    };
    moveButton.onclick = () => {
      window.location.href = post.href;
    };

    listItem.appendChild(linkText);
    listItem.appendChild(moveButton);
    list.appendChild(listItem);
  });

  container.appendChild(headerContainer);
  container.appendChild(list);
  document.body.appendChild(container);
}

// 랜덤 지연 시간 생성 함수
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 다음 게시물로 이동하는 함수
function navigateToNextPost() {
  if (!isAutoNavigateEnabled || currentIndex >= postLinks.length) {
    isAutoNavigateEnabled = false;
    return;
  }

  const link = postLinks[currentIndex];
  const href = link.getAttribute('href');
  if (href) {
    console.log(`게시물 ${currentIndex + 1}로 이동:`, href);
    // 사용자 상호작용 시뮬레이션 후 페이지 이동
    simulateUserInteraction();
    // 3~5초 사이의 랜덤한 지연 시간 적용
    const delay = getRandomDelay(3000, 5000);
    console.log(`${delay/1000}초 후 이동 예정`);
    setTimeout(() => {
      window.location.href = href;
    }, delay);
  }
  currentIndex++;
}

// 페이지 소유자와 게시글 작성자가 동일할 때만 팔로우 자동 실행
function autoFollowIfOwnerIsAuthor() {
  console.log('팔로우 자동 실행 시작');
  
  // URL에서 like=ok 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const isLikeOk = urlParams.get('like') === 'ok';
  console.log('like=ok 파라미터 확인:', isLikeOk);
  
  if (!isLikeOk) {
    console.log('like=ok 파라미터가 없어 팔로우를 실행하지 않습니다.');
    return;
  }

  // 사용자 홈페이지 URL 패턴 확인
  const match = window.location.pathname.match(/^\/(@[\w.\-]+)$/);
  console.log('페이지 주소 확인:', window.location.pathname, match);
  
  if (!match) {
    console.log('사용자 홈페이지가 아닙니다.');
    return;
  }
  
  const pageOwnerId = match[1].replace('@', '');
  console.log('페이지 주소에서 아이디 추출:', pageOwnerId);
  
  // 게시글 작성자 아이디 추출
  const userLink = document.querySelector('.x1a2a7pz.x1n2onr6 a[href^="/@"]');
  if (!userLink) {
    console.log('사용자 링크를 찾을 수 없습니다.');
    return;
  }
  
  const authorHref = userLink.getAttribute('href');
  const authorId = authorHref.replace('/@', '');
  console.log('게시글 작성자 아이디:', authorId);

  // 동일할 때만 팔로우
  if (pageOwnerId === authorId) {
    console.log('페이지 주소와 게시글 작성자 아이디가 동일합니다.');
    handleFollowButton(); // autoHoverAndFollowUser 대신 handleFollowButton 사용
  } else {
    console.log('페이지 주소와 게시글 작성자 아이디가 다릅니다.');
  }
}

// 페이지 로딩 완료 시 실행
function initializeExtension() {
  if (document.readyState === 'complete') {
    console.log('페이지 로딩 완료1');
    displayPostLinks();
    setTimeout(() => {
      autoFollowIfOwnerIsAuthor();
    }, 2000);
    // 포스트 페이지에서만 자동 클릭 실행
    if (window.location.pathname.includes('/post/')) {
      autoClickLikeAndRepostWithNotify();
    }
  } else {
    window.addEventListener('load', () => {
      console.log('페이지 로딩 완료2');
      setTimeout(() => {
        displayPostLinks();
        // 포스트 페이지에서만 자동 클릭 실행
        if (window.location.pathname.includes('/post/')) {
          autoClickLikeAndRepostWithNotify();
        }
        autoFollowIfOwnerIsAuthor();
      }, 2000);
    });
  }
}

// DOM이 준비되면 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUserIds') {
    const userIds = extractUserIds();
    sendResponse({ userIds: userIds });
  } else if (request.action === 'clickFirstUser') {
    clickFirstUserContent();
    sendResponse({ success: true });
  }
});

// 팔로우 버튼 처리 함수
function handleFollowButton() {
  setTimeout(() => {
    // 현재 URL에서 사용자 ID 추출
    const match = window.location.pathname.match(/^\/(@[\w.\-]+)/);
    if (!match) {
      console.log('사용자 ID를 찾을 수 없습니다.');
      return;
    }
    const userId = match[1].replace('@', '');
    console.log('현재 사용자 ID:', userId);
    
    // 이미 팔로우한 사용자인지 확인
    const followedUsers = getFollowedUsers();
    if (followedUsers.includes(userId)) {
      console.log('이미 팔로우한 사용자입니다:', userId);
      // 저장된 게시물 리스트 가져오기
      const savedPosts = localStorage.getItem('savedPosts');
      if (savedPosts) {
        const posts = JSON.parse(savedPosts);
        // 현재 사용자의 다음 게시물 찾기
        const currentIndex = posts.findIndex(post => post.userId === userId);
        if (currentIndex < posts.length - 1) {
          // 다음 사용자의 게시물로 이동 (3~5초 랜덤 지연)
          const delay = getRandomDelay(3000, 5000);
          console.log(`${delay/1000}초 후 다음 게시물로 이동 예정`);
          setTimeout(() => {
            window.location.href = posts[currentIndex + 1].href;
          }, delay);
        } else {
          // 모든 게시물을 팔로우했는지 확인
          const allFollowed = posts.every(post => followedUsers.includes(post.userId));
          if (allFollowed) {
            // 검색 페이지로 이동 (3~5초 랜덤 지연)
            const delay = getRandomDelay(4000, 5000);
            console.log(`${delay/1000}초 후 검색 페이지로 이동 예정`);
            setTimeout(() => {
              window.location.href = CONFIG.SEARCH.URL;
            }, delay);
          } else {
            alert('아직 팔로우하지 않은 게시물이 있습니다.');
          }
        }
      }
      return;
    }

    console.log('팔로우 버튼 찾기 시작...');
    
    // role="button"이고 텍스트가 '팔로우'인 첫 번째 버튼 찾기
    const followBtn = Array.from(document.querySelectorAll('div[role="button"]')).find(btn => {
      const text = btn.textContent.trim();
      return text === '팔로우' || text === 'Follow';
    });

    if (followBtn) {
      console.log('팔로우 버튼 찾음:', followBtn);
      
      // 버튼이 보이도록 스크롤
      followBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 클릭 전 잠시 대기
      setTimeout(() => {
        // 클릭 이벤트 발생
        followBtn.click();
        console.log('팔로우 버튼 클릭 완료');
        
        // 팔로우한 사용자 목록에 추가
        addFollowedUser(userId);
        console.log('팔로우한 사용자 목록에 추가됨:', userId);
        
        // 저장된 게시물 리스트 가져오기
        const savedPosts = localStorage.getItem('savedPosts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          // 현재 사용자의 다음 게시물 찾기
          const currentIndex = posts.findIndex(post => post.userId === userId);
          if (currentIndex < posts.length - 1) {
            // 다음 사용자의 게시물로 이동 (3~5초 랜덤 지연)
            const delay = getRandomDelay(3000, 5000);
            console.log(`${delay/1000}초 후 다음 게시물로 이동 예정`);
            setTimeout(() => {
              window.location.href = posts[currentIndex + 1].href;
            }, delay);
          } else {
            // 모든 게시물을 팔로우했는지 확인
            const allFollowed = posts.every(post => followedUsers.includes(post.userId));
            if (allFollowed) {
              // 검색 페이지로 이동 (3~5초 랜덤 지연)
              const delay = getRandomDelay(4000, 5000);
              console.log(`${delay/1000}초 후 검색 페이지로 이동 예정`);
              setTimeout(() => {
                window.location.href = CONFIG.SEARCH.URL;
              }, delay);
            } else {
              alert('아직 팔로우하지 않은 게시물이 있습니다.');
            }
          }
        }
      }, 500);
    } else {
      console.log('팔로우 버튼을 찾지 못했습니다.');
      // 디버깅을 위해 모든 버튼 출력
      /*const allButtons = document.querySelectorAll('div[role="button"]');
      console.log('=== 모든 버튼 정보 ===');
      allButtons.forEach((btn, index) => {
        console.log(`버튼 ${index + 1}:`, {
          text: btn.textContent.trim(),
          html: btn.outerHTML
        });
      });*/
    }
  }, 2000);
}

// 마지막 URL 저장 변수
let lastUrl = window.location.href;

// URL 변경 감지를 위한 history API 오버라이드
const originalPushState = history.pushState;
history.pushState = function() {
  originalPushState.apply(this, arguments);
  const event = new Event('locationchange');
  window.dispatchEvent(event);
};

const originalReplaceState = history.replaceState;
history.replaceState = function() {
  originalReplaceState.apply(this, arguments);
  const event = new Event('locationchange');
  window.dispatchEvent(event);
};

// popstate 이벤트 리스너 추가
window.addEventListener('popstate', () => {
  const event = new Event('locationchange');
  window.dispatchEvent(event);
});

// locationchange 이벤트 리스너 추가
window.addEventListener('locationchange', () => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('URL 변경 감지:', lastUrl);
    handlePageChange(lastUrl);
  }
});

function simulateUserInteraction() {
  // 마우스 이벤트 시뮬레이션
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  document.body.dispatchEvent(event);
}

// 스크롤 이벤트 처리 함수
function handleScroll() {
  if (!window.location.href.includes('threads.com/search')) return;
  if (window.stopAutoActions) return;

  // 스크롤 위치가 하단에 가까워지면 리스트 갱신
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  // 스크롤이 하단에서 200px 이내에 도달하면 리스트 갱신
  if (scrollHeight - scrollTop - clientHeight < 200) {
    console.log('스크롤 하단 감지, 리스트 갱신 시작');
    // 기존 리스트 제거
    const existingContainer = document.getElementById('post-links-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    // 새로운 리스트 표시
    displayPostLinks();
  }
}

// 검색창만 표시하는 함수
function displaySearchBarOnly() {
  // 기존 리스트 컨테이너 제거
  const existingContainer = document.getElementById('post-links-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // 리스트 컨테이너 생성
  const container = document.createElement('div');
  container.id = 'post-links-container';
  container.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    width: 200px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;

  // 프로필 정보 표시
  const profileContainer = createProfileInfo();
  if (profileContainer) {
    container.appendChild(profileContainer);
  }

  // 검색창 컨테이너
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    display: flex;
    gap: 8px;
    align-items: center;
  `;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '검색어를 입력하세요';
  
  // URL의 검색어와 저장된 검색어 비교
  const urlKeyword = getSearchKeywordFromUrl();
  const savedKeyword = getSavedSearchKeyword();
  
  if (urlKeyword && urlKeyword !== savedKeyword) {
    searchInput.value = urlKeyword;
    saveSearchKeyword(urlKeyword);
  } else {
    searchInput.value = savedKeyword;
  }

  searchInput.style.cssText = `
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 116px;
  `;

  const searchButton = document.createElement('button');
  searchButton.textContent = '검색';
  searchButton.style.cssText = `
    padding: 8px 16px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  `;
  searchButton.onmouseover = () => {
    searchButton.style.backgroundColor = '#0081d6';
  };
  searchButton.onmouseout = () => {
    searchButton.style.backgroundColor = '#0095f6';
  };

  // 검색 기능 구현
  const performSearch = () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      saveSearchKeyword(searchTerm);
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const searchUrl = `https://www.threads.com/search?q=${encodedSearchTerm}&serp_type=default`;
      window.location.href = searchUrl;
    }
  };

  searchButton.onclick = performSearch;
  searchInput.onkeyup = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchButton);
  container.appendChild(searchContainer);
  document.body.appendChild(container);
}

// 프로필 정보 표시 함수
function createProfileInfo() {
  const profileLink = document.querySelector('a[href^="/@"]');
  if (!profileLink) return null;
  
  const userId = profileLink.getAttribute('href').replace('/@', '');
  const profileContainer = document.createElement('div');
  profileContainer.style.cssText = `
    font-size: 14px;
    color: #262626;
    font-weight: bold;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  profileContainer.textContent = `@${userId}`;

  // 정보 버튼 추가
  const infoBtn = document.createElement('button');
  infoBtn.textContent = '정보';
  infoBtn.style.cssText = `
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 12px;
    border: 1px solid #0095f6;
    background: #fff;
    color: #0095f6;
    border-radius: 4px;
    cursor: pointer;
  `;
  infoBtn.onclick = () => {
    // 이미 모달이 있으면 제거
    const existingModal = document.getElementById('profile-info-modal');
    if (existingModal) existingModal.remove();

    // 팔로워 정보
    const followedUsers = getFollowedUsers();
    // 검색 설정 정보
    const searchKeyword = getSavedSearchKeyword();

    // 모달 생성
    const modalBg = document.createElement('div');
    modalBg.id = 'profile-info-modal';
    modalBg.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.2);
      z-index: 1000001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    modalBg.onclick = (e) => {
      if (e.target === modalBg) modalBg.remove();
    };

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.18);
      padding: 24px 28px 20px 28px;
      min-width: 260px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      font-size: 15px;
      color: #222;
      position: relative;
    `;

    // 닫기 버튼
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '닫기';
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: #eee;
      border: none;
      border-radius: 4px;
      padding: 2px 10px;
      cursor: pointer;
      font-size: 13px;
    `;
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);

    // 검색 키워드
    const keywordDiv = document.createElement('div');
    keywordDiv.style.marginBottom = '16px';
    keywordDiv.innerHTML = `<b>검색 키워드:</b> <span style='color:#0095f6'>${searchKeyword || '없음'}</span>`;
    //modal.appendChild(keywordDiv);

    // 팔로워 리스트 섹션
    const followerSection = document.createElement('div');
    followerSection.style.marginBottom = '20px';

    // 팔로워 헤더와 버튼 컨테이너
    const followerHeader = document.createElement('div');
    followerHeader.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `;

    const followerTitle = document.createElement('div');
    followerTitle.innerHTML = `<b>팔로워 목록 (${followedUsers.length}명)</b>`;
    followerHeader.appendChild(followerTitle);

    // 버튼 컨테이너
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      margin-top: 10px;
      display: flex;
      gap: 8px;
    `;

    // 팔로잉 확인 버튼
    const checkFollowingBtn = document.createElement('button');
    checkFollowingBtn.textContent = '팔로잉 확인';
    checkFollowingBtn.style.cssText = `
      padding: 4px 12px;
      background-color: #0095f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      transition: background-color 0.2s;
    `;
    checkFollowingBtn.onmouseover = () => {
      checkFollowingBtn.style.backgroundColor = '#0081d6';
    };
    checkFollowingBtn.onmouseout = () => {
      checkFollowingBtn.style.backgroundColor = '#0095f6';
    };
    checkFollowingBtn.onclick = () => {
      findFollowingUserId();
      // 1초 후 모달 새로고침
      setTimeout(() => {
        modalBg.remove();
        infoBtn.click();
      }, 1000);
    };

    // 초기화 버튼
    const clearButton = document.createElement('button');
    clearButton.textContent = '초기화';
    clearButton.style.cssText = `
      padding: 4px 12px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      transition: background-color 0.2s;
    `;
    clearButton.onmouseover = () => {
      clearButton.style.backgroundColor = '#c82333';
    };
    clearButton.onmouseout = () => {
      clearButton.style.backgroundColor = '#dc3545';
    };
    clearButton.onclick = () => {
      if (confirm('정말로 모든 팔로워 목록과 저장된 게시물을 초기화하시겠습니까?')) {
        // 팔로워 목록 초기화
        const profileLink = document.querySelector('a[href^="/@"]');
        if (profileLink) {
          const userId = profileLink.getAttribute('href').replace('/@', '');
          localStorage.removeItem(`followedUsers_${userId}`);
        }
        // 저장된 게시물 초기화
        localStorage.removeItem('savedPosts');
        showToast('모든 데이터가 초기화되었습니다.');
        // 페이지 새로고침
        location.reload();
      }
    };

    buttonContainer.appendChild(checkFollowingBtn);
    buttonContainer.appendChild(clearButton);
    followerHeader.appendChild(buttonContainer);
    followerSection.appendChild(followerHeader);

    const followerList = document.createElement('ul');
    followerList.style.cssText = 'margin: 8px 0 0 0; padding-left: 18px; max-height: 180px; overflow-y: auto;';
    if (followedUsers.length === 0) {
      const li = document.createElement('li');
      li.textContent = '없음';
      followerList.appendChild(li);
    } else {
      followedUsers.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u;
        followerList.appendChild(li);
      });
    }
    followerSection.appendChild(followerList);
    modal.appendChild(followerSection);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
  };

  profileContainer.appendChild(infoBtn);
  return profileContainer;
}

// 임시: @kitchen_freshlife 팔로워 리스트 저장
(function() {
  const userId = 'ThreadsId';
  const followedUsers = [];
  localStorage.setItem(`followedUsers_${userId}`, JSON.stringify(followedUsers));
})();

// 사용자의 홈페이지에서 팔로잉 상태일 때 사용자 아이디 찾기
function findFollowingUserId() {
  console.log('findFollowingUserId 호출됨');
  // 현재 페이지가 사용자의 홈페이지인지 확인
  if (!window.location.href.includes('threads.com/@')) return;

  // 현재 프로필 사용자 아이디 가져오기
  const currentProfileLink = document.querySelector('a[href^="/@"]');
  if (!currentProfileLink) return;
  const currentUserId = currentProfileLink.getAttribute('href').replace('/@', '');

  // 기존 팔로워 목록 가져오기
  const followedUsers = getFollowedUsers();
  let newFollowedUsers = [...followedUsers]; // 새로운 배열 생성
  let collectedUsers = []; // 새로 수집한 사용자 목록

  // 팔로잉 텍스트가 있는 컨테이너 찾기
  const followingContainers = document.querySelectorAll('div.x6s0dn4.x78zum5.x1q0g3np.x1iyjqo2.x1qughib.x64yxkv');
  
  followingContainers.forEach(container => {
    // 팔로잉 텍스트가 있는지 확인
    const followingText = container.querySelector('div.x6ikm8r.x10wlt62.xlyipyv');
    if (followingText && followingText.textContent === '팔로잉') {
      // 사용자 링크 찾기
      const userLink = container.querySelector('a[href^="/@"]');
      if (userLink) {
        const href = userLink.getAttribute('href');
        if (href) {
          const userId = href.replace('/@', '');
          // 현재 프로필 사용자와 관련된 모든 경로 제외
          if (userId !== currentUserId && 
              !userId.includes('/post/') && 
              !userId.includes('/replies') && 
              !userId.includes('/media') && 
              !userId.includes('/reposts') &&
              !userId.includes(currentUserId)) {
            // 수집된 사용자 목록에 추가
            collectedUsers.push(userId);
            // 중복되지 않는 경우에만 저장 목록에 추가
            if (!newFollowedUsers.includes(userId)) {
              newFollowedUsers.push(userId);
            }
          }
        }
      }
    }
  });

  // 차이점 분석
  console.log('=== 팔로워 분석 ===');
  console.log('로컬 저장 팔로워 수:', followedUsers.length);
  console.log('새로 수집한 팔로워 수:', collectedUsers.length);
  
  // 로컬에만 있는 팔로워
  const onlyInLocal = followedUsers.filter(user => !collectedUsers.includes(user));
  if (onlyInLocal.length > 0) {
    console.log('로컬에만 있는 팔로워:', onlyInLocal);
  }

  // 새로 수집된 팔로워
  const onlyInCollected = collectedUsers.filter(user => !followedUsers.includes(user));
  if (onlyInCollected.length > 0) {
    console.log('새로 수집된 팔로워:', onlyInCollected);
  }

  // 새로운 팔로워가 추가된 경우에만 저장
  if (newFollowedUsers.length > followedUsers.length) {
    localStorage.setItem(`followedUsers_${currentUserId}`, JSON.stringify(newFollowedUsers));
    showToast(`새로운 팔로워 ${newFollowedUsers.length - followedUsers.length}명이 추가되었습니다.`);
  } else {
    showToast('새로운 팔로워가 없습니다.');
  }
}

// 팔로잉 탭 버튼 클릭 이벤트 리스너 추가
function setupFollowingButtonListener() {
  // 탭리스트 찾기
  const tabList = document.querySelector('div[role="tablist"]');
  if (!tabList) return;

  // 팔로잉 탭 찾기
  const followingTab = tabList.querySelector('div[aria-label="팔로잉"]');
  if (followingTab) {
    console.log('팔로잉 탭 버튼 찾음');
    // 이미 이벤트 리스너가 있는지 확인
    if (!followingTab.hasAttribute('data-listener-added')) {
      followingTab.setAttribute('data-listener-added', 'true');
      followingTab.addEventListener('click', () => {
        console.log('팔로잉 탭 버튼 클릭됨');
        // 탭이 선택되었는지 확인
        const isSelected = followingTab.closest('div[role="tab"]').getAttribute('aria-selected') === 'true';
        if (isSelected) {
          // 탭이 선택된 후 약간의 지연을 두고 사용자 아이디 찾기
          setTimeout(() => {
            findFollowingUserId();
          }, 1000);
        }
      });
    }
  }
}

// MutationObserver 설정
function setupFollowingButtonObserver() {
  // 이미 observer가 있다면 제거
  if (window.followingButtonObserver) {
    window.followingButtonObserver.disconnect();
  }

  // 새로운 observer 생성
  window.followingButtonObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // 탭리스트 찾기
        const tabList = document.querySelector('div[role="tablist"]');
        if (tabList) {
          // 팔로잉 탭이 있는지 확인
          const followingTab = tabList.querySelector('div[aria-label="팔로잉"]');
          if (followingTab && !followingTab.hasAttribute('data-listener-added')) {
            console.log('팔로잉 탭 버튼 동적 감지됨');
            setupFollowingButtonListener();
          }
        }
      }
    }
  });

  // body 요소의 변경 감시
  window.followingButtonObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 팔로잉 확인 버튼 생성 함수
function createFollowingCheckButton() {
  // 기존 버튼이 있다면 제거
  const existingButton = document.getElementById('following-check-button');
  if (existingButton) {
    existingButton.remove();
  }

  // 버튼 생성
  const button = document.createElement('button');
  button.id = 'following-check-button';
  button.textContent = '팔로잉확인';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 100px;
    padding: 10px 20px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: background-color 0.2s;
  `;

  // 마우스 오버 효과
  button.onmouseover = () => {
    button.style.backgroundColor = '#0081d6';
  };
  button.onmouseout = () => {
    button.style.backgroundColor = '#0095f6';
  };

  // 클릭 이벤트
  button.onclick = () => {
    // 팔로잉 탭이 선택되어 있는지 확인
    const tabList = document.querySelector('div[role="tablist"]');
    if (tabList) {
      const followingTab = tabList.querySelector('div[aria-label="팔로잉"]');
      if (followingTab) {
        const isSelected = followingTab.closest('div[role="tab"]').getAttribute('aria-selected') === 'true';
        if (!isSelected) {
          // 팔로잉 탭이 선택되어 있지 않으면 클릭
          followingTab.click();
          // 탭 전환 후 약간의 지연을 두고 실행
          setTimeout(() => {
            findFollowingUserId();
          }, 1000);
        } else {
          // 이미 팔로잉 탭이 선택되어 있으면 바로 실행
          findFollowingUserId();
        }
      } else {
        showToast('팔로잉 탭을 찾을 수 없습니다.');
      }
    } else {
      showToast('탭 리스트를 찾을 수 없습니다.');
    }
    showToast('팔로잉 목록을 확인합니다.');
  };

  document.body.appendChild(button);
}

// 페이지 로드 시 실행
window.addEventListener('load', () => {
  setupFollowingButtonObserver();
  // 초기 실행도 시도
  setupFollowingButtonListener();
});

// 팔로워 상태 확인 함수
async function checkFollowerStatus(userId) {
  try {
    // 팔로워의 프로필 페이지 URL
    const profileUrl = `https://www.threads.com/@${userId}`;
    
    // 팔로워의 프로필 페이지에서 상태 확인
    const response = await fetch(profileUrl);
    const text = await response.text();
    
    // 상태 확인
    const isActive = !text.includes('계정이 비활성화되었습니다');
    const isFollowing = text.includes('팔로잉');
    
    return {
      isActive,
      isFollowing,
      lastActive: new Date().toISOString()
    };
  } catch (error) {
    console.error('팔로워 상태 확인 중 오류:', error);
    return {
      isActive: false,
      isFollowing: false,
      lastActive: null
    };
  }
}

// 팔로워 정보 저장 함수
function saveFollowerInfo(userId, status) {
  const profileLink = document.querySelector('a[href^="/@"]');
  if (!profileLink) return;
  
  const currentUserId = profileLink.getAttribute('href').replace('/@', '');
  const followerInfo = JSON.parse(localStorage.getItem(`followerInfo_${currentUserId}`) || '{}');
  
  followerInfo[userId] = {
    ...followerInfo[userId],
    ...status,
    lastChecked: new Date().toISOString()
  };
  
  localStorage.setItem(`followerInfo_${currentUserId}`, JSON.stringify(followerInfo));
} 