// Threads 자동화 스크립트 설정
const CONFIG = {
    // 기본 설정
    DEFAULT_DELAY: 1000, // 기본 대기 시간 (1초)
    REPOST_COOLDOWN: 10000, // 리포스트 쿨다운 시간 (10초)
    
    // 댓글 설정
    COMMENTS: {
        DEFAULT: "스하리~", // 기본 댓글
        VARIANTS: [ // 댓글 변형 목록
            "스하리~",
            "스하리~!",
            "스하리~^^"
        ]
    },
    
    // 검색 설정
    SEARCH: {
        KEYWORD: "스하리1000명", // 검색 키워드
        URL: "https://www.threads.com/search?q=%EC%8A%A4%ED%95%98%EB%A6%AC1000%EB%AA%85&serp_type=default"
    },
    
    // UI 설정
    UI: {
        TOAST_DURATION: 2000, // 토스트 메시지 표시 시간 (2초)
        LIST_WIDTH: 300, // 우측 리스트 너비
        LIST_MAX_HEIGHT: "80vh" // 우측 리스트 최대 높이
    }
};

// 설정값을 외부에서 사용할 수 있도록 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 