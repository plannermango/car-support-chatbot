// 대화 상태 추적
let conversationState = {
    warningLightIdentified: false,
    urgencyLevel: 'normal',
    issueType: null,
    customerFrustrated: false,
    offerMade: false
};

// 챗봇 응답 데이터베이스
const responses = {
    greetings: [
        "안녕하세요! 현대자동차 긴급 상담 서비스입니다. 어떤 문제가 발생하셨나요?",
        "네, 고객님. 상세히 말씀해 주시면 최선을 다해 도와드리겠습니다."
    ],

    urgentWarningLight: {
        initial: "고객님, 먼저 안전한 곳에 정차하셨는지 확인해 주세요. 계기판의 경고등 색상이 어떻게 되시나요? (빨간색/노란색/주황색)",
        red: `<div class="urgent">⚠️ 빨간색 경고등은 즉각적인 조치가 필요한 심각한 상황입니다.</div>
        <div class="info-box">
        <strong>즉시 조치사항:</strong><br>
        1. 안전한 곳에 즉시 정차하세요<br>
        2. 엔진을 끄고 키를 빼주세요<br>
        3. 긴급출동 서비스(1588-5000)로 연락하세요
        </div>
        계기판에 표시된 경고등의 모양을 설명해 주시겠어요? (예: 엔진 모양, 온도계, 배터리, 오일 등)`,
        yellow: `노란색 또는 주황색 경고등은 주의가 필요한 상황입니다.<br><br>
        <div class="info-box">
        단기적으로 주행은 가능하지만, 빠른 시일 내에 점검이 필요합니다.
        </div>
        어떤 모양의 경고등이 켜졌는지 말씀해 주시겠어요?`
    },

    warningLightTypes: {
        engine: `<strong>엔진 경고등 (체크 엔진)</strong>이 켜지셨군요.<br><br>
        <div class="info-box">
        <strong>전문가 진단:</strong><br>
        • 엔진 관리 시스템에 이상이 감지되었습니다<br>
        • 산소 센서, 점화 플러그, 연료 시스템 등 다양한 원인이 있을 수 있습니다<br>
        • 즉시 위험하지는 않지만, 방치하면 연비 저하 및 엔진 손상으로 이어질 수 있습니다
        </div>
        현재 차량에서 이상한 소리나 진동, 출력 저하 등의 증상이 있으신가요?`,

        oil: `<strong class="urgent">엔진 오일 경고등</strong>이 켜지셨네요. 이것은 긴급한 상황입니다!<br><br>
        <div class="urgent">
        ⛔ 즉시 안전한 곳에 정차하고 엔진을 끄세요!
        </div>
        <div class="info-box">
        <strong>위험 요인:</strong><br>
        • 엔진 오일 부족 또는 압력 저하<br>
        • 계속 주행 시 엔진이 심각하게 손상될 수 있습니다<br>
        • 엔진 교체까지 이어질 수 있는 중대한 문제입니다
        </div>
        긴급출동 서비스를 바로 연결해 드릴까요?`,

        battery: `<strong>배터리 경고등</strong>이 켜지셨군요.<br><br>
        <div class="info-box">
        <strong>전문가 분석:</strong><br>
        • 충전 시스템에 문제가 있을 수 있습니다<br>
        • 배터리 또는 알터네이터(발전기) 고장 가능성<br>
        • 곧 시동이 꺼질 수 있으니 주의하세요
        </div>
        <strong>권장 조치:</strong> 가까운 정비소로 즉시 이동하시거나, 불안하시면 긴급출동 서비스를 이용하세요.<br><br>
        어떻게 도와드릴까요?`,

        temperature: `<strong class="urgent">엔진 과열 경고등</strong>입니다!<br><br>
        <div class="urgent">
        🔥 매우 위험한 상황입니다. 즉시 정차하세요!
        </div>
        <div class="info-box">
        <strong>즉각 조치:</strong><br>
        1. 안전한 곳에 즉시 정차<br>
        2. 엔진을 끄고 15-20분 대기<br>
        3. 보닛을 열어 엔진을 식히세요 (화상 주의!)<br>
        4. 냉각수가 부족한지 확인 (엔진이 식은 후)
        </div>
        계속 주행하시면 엔진이 손상됩니다. 긴급출동이 필요하신가요?`
    },

    frustration: [
        "고객님의 불편하신 마음 충분히 이해합니다. 저희가 최대한 빠르게 해결해 드리겠습니다.",
        "정말 죄송합니다, 고객님. 이런 상황에서 불안하신 것 당연합니다. 제가 최선을 다해 도와드리겠습니다.",
        "고객님, 걱정하지 마세요. 저희 전문 기술진이 신속하게 처리해 드리겠습니다."
    ],

    solutions: {
        emergency: `<div class="success-box">
        <strong>✅ 긴급출동 서비스 안내</strong><br><br>
        📞 <strong>긴급출동: 1588-5000</strong><br>
        • 24시간 운영<br>
        • 평균 30분 이내 도착<br>
        • 무상 견인 서비스 포함 (보증 기간 내)<br>
        • 현장 응급 수리 가능
        </div>
        지금 바로 연결해 드릴까요? 고객님의 위치를 알려주시면 가장 가까운 기사님을 배정해 드리겠습니다.`,

        appointment: `<div class="success-box">
        <strong>📅 서비스센터 예약</strong><br><br>
        가까운 현대자동차 서비스센터로 예약을 도와드리겠습니다.<br><br>
        <strong>예약 가능 시간:</strong><br>
        • 오늘 오후 2시<br>
        • 오늘 오후 4시<br>
        • 내일 오전 9시<br>
        • 내일 오전 11시
        </div>
        어느 시간이 편하신가요? 또는 선호하시는 서비스센터 위치가 있으신가요?`,

        temporarySolution: `<div class="info-box">
        <strong>🔧 임시 조치 방안</strong><br><br>
        현재 상황에서 시도해 볼 수 있는 방법:<br>
        1. 차량을 안전한 곳에 정차<br>
        2. 엔진을 끄고 5-10분 대기<br>
        3. 다시 시동을 걸어 경고등 상태 확인<br>
        4. 경고등이 사라지면 저속으로 가까운 정비소로 이동
        </div>
        ⚠️ 단, 경고등이 계속 켜져 있거나 재점등되면 즉시 정차하시고 긴급출동을 요청하세요.`
    }
};

// DOM 요소
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const quickButtons = document.querySelectorAll('.quick-btn');

// 메시지 추가 함수
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const sender = document.createElement('strong');
    sender.textContent = isUser ? '고객' : '상담원 AI';

    const text = document.createElement('div');
    text.innerHTML = content;

    messageContent.appendChild(sender);
    messageContent.appendChild(text);
    messageDiv.appendChild(messageContent);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.appendChild(indicator);
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 타이핑 인디케이터 제거
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// 키워드 분석 및 응답 생성
function analyzeAndRespond(message) {
    const lowerMessage = message.toLowerCase();

    // 긴급 상황 감지
    if (lowerMessage.includes('급해') || lowerMessage.includes('긴급') ||
        lowerMessage.includes('빨리') || lowerMessage.includes('위험')) {
        conversationState.urgencyLevel = 'high';
    }

    // 불만/좌절 감지
    if (lowerMessage.includes('답답') || lowerMessage.includes('화나') ||
        lowerMessage.includes('짜증') || lowerMessage.includes('안되') ||
        lowerMessage.includes('이해 못') || lowerMessage.includes('왜 이래')) {
        conversationState.customerFrustrated = true;
        return responses.frustration[Math.floor(Math.random() * responses.frustration.length)] +
               "<br><br>구체적으로 어떤 부분이 불편하신가요? 제가 즉시 해결해 드리겠습니다.";
    }

    // 경고등 관련
    if (lowerMessage.includes('경고등') || lowerMessage.includes('계기판') ||
        lowerMessage.includes('불이 켜') || lowerMessage.includes('표시등')) {
        conversationState.warningLightIdentified = true;

        // 색상 확인
        if (lowerMessage.includes('빨간') || lowerMessage.includes('레드') || lowerMessage.includes('red')) {
            return responses.urgentWarningLight.red;
        } else if (lowerMessage.includes('노란') || lowerMessage.includes('주황') ||
                   lowerMessage.includes('yellow') || lowerMessage.includes('amber')) {
            return responses.urgentWarningLight.yellow;
        }

        return responses.urgentWarningLight.initial;
    }

    // 경고등 종류 식별
    if (lowerMessage.includes('엔진') && !lowerMessage.includes('오일')) {
        conversationState.issueType = 'engine';
        return responses.warningLightTypes.engine;
    }

    if (lowerMessage.includes('오일')) {
        conversationState.issueType = 'oil';
        conversationState.urgencyLevel = 'critical';
        return responses.warningLightTypes.oil;
    }

    if (lowerMessage.includes('배터리') || lowerMessage.includes('battery')) {
        conversationState.issueType = 'battery';
        return responses.warningLightTypes.battery;
    }

    if (lowerMessage.includes('온도') || lowerMessage.includes('과열') || lowerMessage.includes('뜨거')) {
        conversationState.issueType = 'temperature';
        conversationState.urgencyLevel = 'critical';
        return responses.warningLightTypes.temperature;
    }

    // 증상 관련
    if (lowerMessage.includes('소리') || lowerMessage.includes('진동') ||
        lowerMessage.includes('출력') || lowerMessage.includes('힘이 없')) {
        return "말씀하신 증상이 있다면 더욱 빠른 점검이 필요합니다.<br><br>" +
               "두 가지 옵션을 제안드립니다:<br>" +
               "1️⃣ 긴급출동 서비스 (즉시 출동)<br>" +
               "2️⃣ 가까운 서비스센터 예약 (오늘/내일 가능)<br><br>" +
               "어떤 방법을 원하시나요?";
    }

    // 해결책 요청
    if (lowerMessage.includes('출동') || lowerMessage.includes('견인') ||
        lowerMessage.includes('오게') || lowerMessage.includes('불러')) {
        conversationState.offerMade = true;
        return responses.solutions.emergency;
    }

    if (lowerMessage.includes('예약') || lowerMessage.includes('방문') ||
        lowerMessage.includes('서비스센터') || lowerMessage.includes('정비소')) {
        conversationState.offerMade = true;
        return responses.solutions.appointment;
    }

    if (lowerMessage.includes('임시') || lowerMessage.includes('응급') ||
        lowerMessage.includes('조치') || lowerMessage.includes('어떻게')) {
        return responses.solutions.temporarySolution;
    }

    // 위치 정보
    if (lowerMessage.includes('위치') || lowerMessage.includes('어디') ||
        lowerMessage.match(/[가-힣]+시|[가-힣]+구|[가-힣]+동/)) {
        return "고객님의 위치를 확인했습니다. 해당 지역에서 가장 가까운 서비스센터와 긴급출동 기사님을 배정하겠습니다.<br><br>" +
               "<div class='success-box'>" +
               "<strong>📍 예상 도착 시간: 약 25-30분</strong><br>" +
               "기사님 연락처: 010-XXXX-XXXX<br>" +
               "차량 번호: 서울12가3456" +
               "</div>" +
               "조금만 기다려 주시면 곧 도착할 예정입니다. 안전한 곳에 계세요!";
    }

    // 시간 선택
    if (lowerMessage.match(/\d+시/) || lowerMessage.includes('오전') ||
        lowerMessage.includes('오후') || lowerMessage.includes('내일') || lowerMessage.includes('오늘')) {
        return "<div class='success-box'>" +
               "✅ <strong>예약이 완료되었습니다!</strong><br><br>" +
               "📅 예약 일시: " + message + "<br>" +
               "📍 서비스센터: 현대 강남 서비스센터<br>" +
               "📞 연락처: 02-XXXX-XXXX<br>" +
               "⏱️ 예상 소요시간: 1-2시간<br><br>" +
               "예약 시간 30분 전에 안내 문자를 보내드리겠습니다.<br>" +
               "더 도움이 필요하신 사항이 있으신가요?" +
               "</div>";
    }

    // 긍정 응답
    if (lowerMessage.includes('네') || lowerMessage.includes('예') ||
        lowerMessage.includes('그래') || lowerMessage.includes('응') ||
        lowerMessage.includes('yes') || lowerMessage.includes('ok')) {
        if (!conversationState.offerMade) {
            return "네, 고객님. 어떤 도움이 필요하신가요?<br><br>" +
                   "1️⃣ 긴급출동 요청<br>" +
                   "2️⃣ 서비스센터 예약<br>" +
                   "3️⃣ 추가 상담";
        }
    }

    // 감사 인사
    if (lowerMessage.includes('감사') || lowerMessage.includes('고마') ||
        lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
        return "천만에요, 고객님! 현대자동차를 이용해 주셔서 감사합니다. 😊<br><br>" +
               "안전 운전하시고, 추가로 필요하신 사항이 있으시면 언제든지 연락 주세요.<br>" +
               "24시간 상담 가능합니다!";
    }

    // 기본 응답
    return "고객님의 말씀을 정확히 이해하지 못했습니다. 😅<br><br>" +
           "다음 중 하나를 선택해 주시겠어요?<br>" +
           "• <strong>경고등 종류</strong> 설명 (엔진, 오일, 배터리, 온도 등)<br>" +
           "• <strong>긴급출동</strong> 요청<br>" +
           "• <strong>서비스센터 예약</strong><br>" +
           "• 현재 <strong>차량 증상</strong> 설명";
}

// 메시지 전송 처리
function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';

    // 타이핑 인디케이터 표시
    showTypingIndicator();

    // 실제 챗봇처럼 1-2초 지연
    setTimeout(() => {
        removeTypingIndicator();
        const response = analyzeAndRespond(message);
        addMessage(response);
    }, 1000 + Math.random() * 1000);
}

// 이벤트 리스너
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// 퀵 액션 버튼
quickButtons.forEach(button => {
    button.addEventListener('click', () => {
        const message = button.getAttribute('data-message');
        userInput.value = message;
        handleSendMessage();
    });
});
