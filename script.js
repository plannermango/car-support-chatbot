// 대화 상태 추적
let conversationState = {
    warningLightIdentified: false,
    urgencyLevel: 'normal',
    issueType: null,
    customerFrustrated: false,
    requestedImmediate: false,
    appointmentOffered: false,
    appointmentDeclined: 0, // 예약을 거부한 횟수 (교착 상황 유발)
    priceInquired: false,
    procedureExplained: false,
    conversationCount: 0
};

// 현재 시간 포맷팅
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// 챗봇 응답 데이터베이스 (더 전문적이고 차분한 톤)
const responses = {
    urgentWarningLight: {
        initial: `고객님, 먼저 차량의 안전을 최우선으로 생각해야 합니다.<br><br>
        <div class="info-box">
        <strong>현재 상황 파악이 필요합니다</strong><br>
        1. 현재 주행 중이신가요, 아니면 정차 상태이신가요?<br>
        2. 경고등의 색상을 말씀해 주시겠습니까? (빨간색/노란색/주황색)<br>
        3. 경고등과 함께 경고음이 울리고 있습니까?
        </div>
        정확한 상황 파악을 위해 차근차근 확인해 드리겠습니다.`,

        red: `<div class="warning-box">
        <strong>⚠️ 심각도: 높음 - 즉각 조치 필요</strong><br>
        빨간색 경고등은 차량의 안전과 직결된 중대한 문제를 나타냅니다.
        </div>
        <div class="info-box">
        <strong>즉시 시행해야 할 안전 조치</strong><br>
        1. 가능한 한 빨리 안전한 장소에 정차하십시오<br>
        2. 비상등을 켜고 후방 안전을 확인하십시오<br>
        3. 엔진을 정지하고 키를 빼십시오<br>
        4. 차량 내부에서 대기하시되, 위험 시 차량 밖으로 대피하십시오
        </div>
        계기판에 표시된 경고등의 형태를 구체적으로 설명해 주시겠습니까?<br>
        (예: 엔진 모양, 온도계, 배터리 표시, 오일 표시 등)`,

        yellow: `노란색 또는 주황색 경고등은 주의가 필요한 상황입니다.<br><br>
        <div class="info-box">
        <strong>현재 상태 평가</strong><br>
        • 단기적 주행은 가능하나, 신속한 점검이 필요합니다<br>
        • 문제가 악화되기 전 조치하시는 것을 권장드립니다<br>
        • 장거리 운행은 삼가시는 것이 안전합니다
        </div>
        경고등의 모양과 함께 차량에서 느껴지는 이상 증상이 있으시면 말씀해 주십시오.`
    },

    warningLightTypes: {
        engine: `<strong>엔진 경고등 (Check Engine Light) 진단</strong><br><br>
        <div class="info-box">
        <strong>전문가 분석</strong><br>
        엔진 관리 시스템(ECU)이 비정상적인 데이터를 감지한 상태입니다.<br><br>
        <strong>주요 원인 (확률 순)</strong><br>
        • 산소 센서 오작동 (35%)<br>
        • 점화 플러그 또는 점화 코일 문제 (25%)<br>
        • 연료 시스템 이상 (20%)<br>
        • 배기가스 재순환(EGR) 밸브 고장 (15%)<br>
        • 기타 센서 이상 (5%)
        </div>
        현재 차량에서 다음과 같은 증상이 나타나고 있습니까?<br>
        - 가속 시 힘이 떨어지는 느낌<br>
        - 평소보다 연비가 크게 저하됨<br>
        - 공회전이 불안정하거나 시동 꺼짐<br>
        - 이상한 소리나 진동`,

        oil: `<div class="warning-box">
        <strong>🚨 긴급 - 엔진 오일 압력 경고</strong><br>
        이것은 즉각적인 대응이 필요한 중대한 상황입니다.
        </div>
        <div class="info-box">
        <strong>위험성 평가</strong><br>
        • 엔진 오일 부족 또는 오일 펌프 고장<br>
        • 계속 주행 시 엔진 내부 부품 마모 가속화<br>
        • 최악의 경우 엔진 완전 손상 (수리 비용 500만원 이상)<br>
        • 즉시 정차하지 않으면 돌이킬 수 없는 손상 발생 가능
        </div>
        <strong>현재 상황:</strong> 차량을 정차하셨습니까?<br><br>
        정차하신 경우, 긴급출동 서비스를 즉시 연결해 드리는 것을 강력히 권장드립니다.`,

        battery: `<strong>충전 시스템 경고등 진단</strong><br><br>
        <div class="info-box">
        <strong>기술적 분석</strong><br>
        차량의 전기 충전 시스템에 이상이 감지되었습니다.<br><br>
        <strong>가능한 원인</strong><br>
        • 알터네이터(발전기) 고장 - 확률 60%<br>
        • 배터리 수명 종료 - 확률 30%<br>
        • 충전 회로 단선 또는 벨트 끊어짐 - 확률 10%
        </div>
        <div class="warning-box">
        <strong>주의사항</strong><br>
        배터리가 방전되면 주행 중 갑자기 시동이 꺼질 수 있습니다.<br>
        전동식 파워 스티어링 차량의 경우 조향이 매우 무거워질 수 있습니다.
        </div>
        가까운 서비스센터로 이동하시거나, 불안하신 경우 긴급출동을 요청하시는 것이 안전합니다.<br><br>
        어떻게 도와드릴까요?`,

        temperature: `<div class="warning-box">
        <strong>🔥 엔진 과열 경고 - 즉시 조치 필요</strong>
        </div>
        <div class="info-box">
        <strong>즉각 시행 사항</strong><br>
        1. <strong>즉시 안전한 곳에 정차</strong>하십시오<br>
        2. 에어컨을 끄고 히터를 최대로 켜십시오 (엔진 냉각 도움)<br>
        3. 엔진을 끄고 <strong>최소 20분 이상 대기</strong>하십시오<br>
        4. 보닛을 열어 엔진룸 환기 (화상 주의!)<br>
        5. 엔진이 충분히 식은 후 냉각수 확인
        </div>
        <div class="warning-box">
        <strong>⛔ 절대 금지 사항</strong><br>
        • 뜨거운 상태에서 라디에이터 캡을 열지 마십시오 (증기 분출로 화상 위험)<br>
        • 과열 상태로 계속 주행하지 마십시오 (엔진 헤드 가스켓 손상, 수리비 200만원 이상)
        </div>
        현재 엔진을 정지하고 대기 중이신가요?`
    },

    frustration: {
        first: "고객님, 불편을 드려 대단히 죄송합니다. 고객님의 상황을 충분히 이해하고 있으며, 가능한 한 신속하게 해결 방안을 찾아드리겠습니다.",
        repeated: "고객님의 답답하신 마음 충분히 공감합니다. 다만 고객님의 안전과 차량을 위해 정확한 절차를 따르는 것이 중요합니다. 최선을 다해 도와드리겠습니다.",
        severe: "고객님, 진정하시고 제 말씀을 들어주시겠습니까? 저희도 고객님을 돕고 싶습니다만, 정확한 정보 없이는 적절한 조치를 취하기 어렵습니다. 함께 차근차근 해결해 나가겠습니다."
    },

    deadlock: {
        noAppointment: `고객님, 현재 상황을 말씀드리겠습니다.<br><br>
        <div class="info-box">
        <strong>현재 예약 현황</strong><br>
        • 오늘 잔여 예약: 마감<br>
        • 내일 가능 시간: 오전 10시, 오후 3시<br>
        • 모레 가능 시간: 오전 9시, 11시, 오후 2시, 4시
        </div>
        즉시 수리를 원하신다는 고객님의 마음은 충분히 이해합니다. 하지만 서비스센터의 물리적 수용 능력에는 한계가 있습니다.<br><br>
        <strong>대안 제시:</strong><br>
        1. 긴급출동 서비스 - 현장 점검 후 견인 (30-40분 소요)<br>
        2. 타 지역 서비스센터 안내 (예약 가능 여부 확인)<br>
        3. 대기 등록 (취소 발생 시 우선 연락)<br><br>
        어떤 방법을 선택하시겠습니까?`,

        costConcern: `수리 비용에 대해 우려하시는 것은 당연합니다. 정확한 견적을 말씀드리겠습니다.<br><br>
        <div class="info-box">
        <strong>예상 수리 비용 (진단 후 확정)</strong><br>
        • 기본 진단 비용: 무료 (보증기간 내) / 30,000원 (보증 만료)<br>
        • 예상 부품비: 150,000원 ~ 800,000원<br>
        • 예상 공임비: 80,000원 ~ 200,000원<br>
        • 총 예상 금액: 230,000원 ~ 1,000,000원
        </div>
        <div class="warning-box">
        <strong>중요 안내</strong><br>
        정확한 진단 없이는 확정 금액을 말씀드리기 어렵습니다. 수리 전 반드시 고객님께 견적을 안내드리고 승인 후 진행됩니다.
        </div>
        비용이 부담되신다면 다음 옵션도 고려해 보실 수 있습니다:<br>
        • 정비 할부 서비스<br>
        • 단계별 수리 (긴급한 부분만 우선 수리)<br>
        • 순정 부품 대신 우수 재생 부품 사용<br><br>
        어떻게 진행하시겠습니까?`,

        procedureConfusion: `고객님, 제가 절차를 다시 한 번 명확하게 정리해 드리겠습니다.<br><br>
        <div class="success-box">
        <strong>📋 서비스 진행 절차 (단계별 설명)</strong><br><br>
        <strong>1단계: 예약 및 입고</strong><br>
        → 전화 또는 온라인으로 예약<br>
        → 예약 시간에 서비스센터 방문<br>
        → 접수 데스크에서 차량 증상 설명<br><br>
        <strong>2단계: 정밀 진단 (약 30-60분)</strong><br>
        → 전문 기술사가 차량 점검<br>
        → 진단기로 오류 코드 확인<br>
        → 문제 원인 파악<br><br>
        <strong>3단계: 견적 안내 및 승인</strong><br>
        → 고객님께 진단 결과 설명<br>
        → 수리 항목 및 비용 안내<br>
        → 고객님의 승인 후 작업 시작<br><br>
        <strong>4단계: 수리 진행 (부품 및 작업에 따라 1-3시간)</strong><br><br>
        <strong>5단계: 완료 및 인도</strong><br>
        → 수리 내역 설명<br>
        → 결제 후 차량 인도<br>
        → 3개월 품질 보증
        </div>
        이해가 되셨습니까? 어느 부분이 불분명하신지 말씀해 주시면 더 자세히 설명드리겠습니다.`
    },

    solutions: {
        emergency: `<div class="success-box">
        <strong>✅ 긴급출동 서비스 신청</strong><br><br>
        <strong>📞 긴급출동 센터: 1588-5000</strong><br><br>
        <strong>서비스 내용:</strong><br>
        • 24시간 365일 운영<br>
        • 평균 도착 시간: 25-35분<br>
        • 현장 응급 조치 가능<br>
        • 필요 시 가까운 서비스센터로 견인<br>
        • 무상 견인 (보증 기간 내 또는 긴급상황)<br><br>
        <strong>준비 사항:</strong><br>
        • 차량 번호<br>
        • 정확한 현재 위치<br>
        • 증상 설명<br>
        • 차량 등록증 (가능 시)
        </div>
        지금 바로 연결해 드릴까요? 현재 위치를 알려주시면 가장 가까운 출동 팀을 배정해 드리겠습니다.`,

        appointment: `<div class="success-box">
        <strong>📅 서비스센터 예약 안내</strong><br><br>
        <strong>가까운 서비스센터 선택:</strong><br>
        1. 강남 서비스센터 (서울 강남구 테헤란로)<br>
        2. 송파 서비스센터 (서울 송파구 올림픽로)<br>
        3. 마곡 서비스센터 (서울 강서구 마곡중앙로)<br><br>
        <strong>예약 가능 시간:</strong><br>
        • 내일 (${getNextDay()}) 10:00, 15:00<br>
        • 모레 (${getDayAfterNext()}) 09:00, 11:00, 14:00, 16:00<br><br>
        <strong>예상 소요 시간:</strong><br>
        진단 30분 + 수리 1-3시간 (부품 재고 상황에 따라 변동)
        </div>
        어느 서비스센터의 어느 시간대가 편하신가요?`,

        temporarySolution: `<div class="info-box">
        <strong>🔧 임시 응급 조치 방안</strong><br><br>
        <strong>시도해 볼 수 있는 방법:</strong><br>
        1. 차량을 완전히 정차하고 시동을 끕니다<br>
        2. 5-10분간 차량을 쉬게 합니다<br>
        3. 다시 시동을 걸어 경고등 상태를 확인합니다<br>
        4. 경고등이 사라졌다면 저속(60km/h 이하)으로 가까운 정비소로 이동합니다<br><br>
        <div class="warning-box">
        <strong>⚠️ 주의 사항</strong><br>
        • 경고등이 계속 켜져 있거나 재점등되면 즉시 정차하십시오<br>
        • 이상한 소리, 냄새, 진동이 느껴지면 주행을 중단하십시오<br>
        • 임시 조치는 어디까지나 응급 상황용입니다<br>
        • 반드시 전문가 진단을 받으시기 바랍니다
        </div>
        </div>
        이 방법을 시도해 보시겠습니까?`
    }
};

// 날짜 헬퍼 함수
function getNextDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function getDayAfterNext() {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

// DOM 요소
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const quickButtons = document.querySelectorAll('.quick-btn');

// 초기 시간 설정
document.addEventListener('DOMContentLoaded', () => {
    const initialTime = document.getElementById('initialTime');
    if (initialTime) {
        initialTime.textContent = getCurrentTime();
    }
});

// 메시지 추가 함수
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    if (!isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#002c5f"/>
                <path d="M16 16c2.651 0 4.8-2.149 4.8-4.8S18.651 6.4 16 6.4s-4.8 2.149-4.8 4.8S13.349 16 16 16zM16 17.6c-3.534 0-6.4 2.149-6.4 4.8v1.6h12.8v-1.6c0-2.651-2.866-4.8-6.4-4.8z" fill="#fff"/>
            </svg>
        `;
        messageDiv.appendChild(avatar);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const header = document.createElement('div');
    header.className = 'message-header';

    const sender = document.createElement('strong');
    sender.textContent = isUser ? '고객' : '김서연 상담사';

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    header.appendChild(sender);
    header.appendChild(time);

    const text = document.createElement('div');
    text.innerHTML = content;

    messageContent.appendChild(header);
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

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#002c5f"/>
            <path d="M16 16c2.651 0 4.8-2.149 4.8-4.8S18.651 6.4 16 6.4s-4.8 2.149-4.8 4.8S13.349 16 16 16zM16 17.6c-3.534 0-6.4 2.149-6.4 4.8v1.6h12.8v-1.6c0-2.651-2.866-4.8-6.4-4.8z" fill="#fff"/>
        </svg>
    `;
    typingDiv.appendChild(avatar);

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
    conversationState.conversationCount++;

    // 긴급 상황 감지
    if (lowerMessage.includes('급해') || lowerMessage.includes('긴급') ||
        lowerMessage.includes('빨리') || lowerMessage.includes('위험') ||
        lowerMessage.includes('갑자기')) {
        conversationState.urgencyLevel = 'high';
    }

    // 즉시 수리 요구 (교착 상황 유발)
    if (lowerMessage.includes('지금') || lowerMessage.includes('즉시') ||
        lowerMessage.includes('당장') || lowerMessage.includes('바로') ||
        lowerMessage.includes('오늘')) {
        conversationState.requestedImmediate = true;
    }

    // 불만/좌절 감지 (교착 상황)
    if (lowerMessage.includes('답답') || lowerMessage.includes('화나') ||
        lowerMessage.includes('짜증') || lowerMessage.includes('안되') ||
        lowerMessage.includes('이해 못') || lowerMessage.includes('왜 이래') ||
        lowerMessage.includes('말이 안') || lowerMessage.includes('말도 안')) {
        conversationState.customerFrustrated = true;

        if (conversationState.conversationCount <= 3) {
            return responses.frustration.first;
        } else if (conversationState.conversationCount <= 6) {
            return responses.frustration.repeated;
        } else {
            return responses.frustration.severe;
        }
    }

    // 예약 거부 (교착 상황 심화)
    if ((lowerMessage.includes('예약') || lowerMessage.includes('내일') || lowerMessage.includes('모레'))
        && (lowerMessage.includes('싫') || lowerMessage.includes('안돼') ||
            lowerMessage.includes('안 돼') || lowerMessage.includes('못') ||
            lowerMessage.includes('불가'))) {
        conversationState.appointmentDeclined++;

        if (conversationState.appointmentDeclined >= 2) {
            // 교착 상황 - 고객이 계속 예약을 거부
            return responses.deadlock.noAppointment;
        } else {
            return "고객님의 상황이 급하신 것은 이해합니다. 하지만 안전한 수리를 위해서는 적절한 시간이 필요합니다. 긴급출동 서비스를 이용하시는 것은 어떠신가요?";
        }
    }

    // 비용 문의 (교착 상황 가능성)
    if (lowerMessage.includes('비용') || lowerMessage.includes('가격') ||
        lowerMessage.includes('얼마') || lowerMessage.includes('돈') ||
        lowerMessage.includes('요금') || lowerMessage.includes('수리비')) {
        conversationState.priceInquired = true;
        return responses.deadlock.costConcern;
    }

    // 절차 혼란 (교착 상황)
    if (lowerMessage.includes('무슨 말') || lowerMessage.includes('이해가') ||
        lowerMessage.includes('모르겠') || lowerMessage.includes('어렵') ||
        lowerMessage.includes('복잡') || lowerMessage.includes('절차')) {
        return responses.deadlock.procedureConfusion;
    }

    // 경고등 관련
    if (lowerMessage.includes('경고등') || lowerMessage.includes('계기판') ||
        lowerMessage.includes('불이 켜') || lowerMessage.includes('표시등') ||
        lowerMessage.includes('램프')) {
        conversationState.warningLightIdentified = true;

        // 색상 확인
        if (lowerMessage.includes('빨간') || lowerMessage.includes('레드') ||
            lowerMessage.includes('red') || lowerMessage.includes('적색')) {
            return responses.urgentWarningLight.red;
        } else if (lowerMessage.includes('노란') || lowerMessage.includes('주황') ||
                   lowerMessage.includes('yellow') || lowerMessage.includes('amber') ||
                   lowerMessage.includes('황색')) {
            return responses.urgentWarningLight.yellow;
        }

        return responses.urgentWarningLight.initial;
    }

    // 경고등 종류 식별
    if (lowerMessage.includes('엔진') && !lowerMessage.includes('오일') && !lowerMessage.includes('온도')) {
        conversationState.issueType = 'engine';
        return responses.warningLightTypes.engine;
    }

    if (lowerMessage.includes('오일')) {
        conversationState.issueType = 'oil';
        conversationState.urgencyLevel = 'critical';
        return responses.warningLightTypes.oil;
    }

    if (lowerMessage.includes('배터리') || lowerMessage.includes('battery') ||
        lowerMessage.includes('충전')) {
        conversationState.issueType = 'battery';
        return responses.warningLightTypes.battery;
    }

    if (lowerMessage.includes('온도') || lowerMessage.includes('과열') ||
        lowerMessage.includes('뜨거') || lowerMessage.includes('열')) {
        conversationState.issueType = 'temperature';
        conversationState.urgencyLevel = 'critical';
        return responses.warningLightTypes.temperature;
    }

    // 주행/정차 상태
    if (lowerMessage.includes('주행') || lowerMessage.includes('달리') ||
        lowerMessage.includes('운전')) {
        return "고객님, 주행 중이시라면 즉시 안전한 곳에 정차하시는 것을 권장드립니다. 현재 정차하셨습니까?";
    }

    if (lowerMessage.includes('정차') || lowerMessage.includes('멈춤') ||
        lowerMessage.includes('세웠') || lowerMessage.includes('정지')) {
        return "네, 안전하게 정차하신 것은 올바른 조치입니다. 이제 경고등의 색상과 모양을 확인해 주시겠습니까?";
    }

    // 증상 관련
    if (lowerMessage.includes('소리') || lowerMessage.includes('진동') ||
        lowerMessage.includes('출력') || lowerMessage.includes('힘이 없') ||
        lowerMessage.includes('떨림') || lowerMessage.includes('이상')) {
        return "말씀하신 증상은 즉시 전문가 점검이 필요한 상태입니다.<br><br>" +
               "<div class='info-box'>" +
               "<strong>권장 조치</strong><br>" +
               "1. 긴급출동 서비스 요청 (즉시 출동)<br>" +
               "2. 가까운 서비스센터 예약 (익일 가능)<br>" +
               "3. 임시 조치 후 저속 이동 (위험 부담 있음)" +
               "</div>" +
               "어떤 방법을 원하시나요?";
    }

    // 해결책 요청
    if (lowerMessage.includes('출동') || lowerMessage.includes('견인') ||
        lowerMessage.includes('오게') || lowerMessage.includes('불러') ||
        lowerMessage.includes('보내')) {
        conversationState.offerMade = true;
        return responses.solutions.emergency;
    }

    if (lowerMessage.includes('예약') || lowerMessage.includes('방문') ||
        lowerMessage.includes('서비스센터') || lowerMessage.includes('정비소')) {
        conversationState.appointmentOffered = true;

        // 즉시 수리를 원하는데 예약을 제안하면 교착 상황 발생
        if (conversationState.requestedImmediate && !conversationState.appointmentDeclined) {
            conversationState.appointmentDeclined = 1;
            return "고객님, 이해는 하지만 현재 당일 예약이 모두 마감된 상태입니다.<br><br>" +
                   "예약 없이 방문하시면 대기 시간이 3-4시간 이상 소요될 수 있습니다. 긴급출동 서비스를 이용하시는 것이 더 빠를 수 있습니다.<br><br>" +
                   "그래도 직접 방문하시겠습니까?";
        }

        return responses.solutions.appointment;
    }

    if (lowerMessage.includes('임시') || lowerMessage.includes('응급') ||
        lowerMessage.includes('조치') || lowerMessage.includes('스스로') ||
        lowerMessage.includes('직접')) {
        return responses.solutions.temporarySolution;
    }

    // 위치 정보
    if (lowerMessage.includes('위치') || lowerMessage.includes('어디') ||
        lowerMessage.match(/[가-힣]+시|[가-힣]+구|[가-힣]+동/)) {
        return "고객님의 위치를 확인했습니다. 해당 지역 담당 팀에 연결하겠습니다.<br><br>" +
               "<div class='success-box'>" +
               "<strong>📍 긴급출동 배정 완료</strong><br>" +
               "담당 기사: 이준호 (경력 12년, 만족도 98%)<br>" +
               "차량 번호: 서울70나1234<br>" +
               "예상 도착: 약 28분<br>" +
               "연락처: 010-XXXX-5678" +
               "</div>" +
               "기사님이 출발하셨습니다. 안전한 곳에서 대기해 주시기 바랍니다.<br>" +
               "추가로 궁금하신 사항이 있으신가요?";
    }

    // 시간 선택
    if (lowerMessage.match(/\d+시/) || lowerMessage.includes('오전') ||
        lowerMessage.includes('오후') || lowerMessage.includes('내일') ||
        lowerMessage.includes('모레')) {
        return "<div class='success-box'>" +
               "✅ <strong>예약이 완료되었습니다</strong><br><br>" +
               "📅 예약 일시: " + message + "<br>" +
               "📍 서비스센터: 현대 강남 서비스센터<br>" +
               "주소: 서울시 강남구 테헤란로 123<br>" +
               "담당자: 박정민 수석기술사<br>" +
               "📞 연락처: 02-1234-5678<br>" +
               "⏱️ 예상 소요시간: 진단 30분 + 수리 1-3시간<br><br>" +
               "<strong>준비물:</strong> 차량등록증, 신분증<br>" +
               "예약 시간 30분 전 안내 문자를 보내드립니다.<br><br>" +
               "예약하신 시간에 뵙겠습니다. 안전 운전하세요!" +
               "</div>";
    }

    // 긍정 응답
    if (lowerMessage.includes('네') || lowerMessage.includes('예') ||
        lowerMessage.includes('그래') || lowerMessage.includes('응') ||
        lowerMessage.includes('yes') || lowerMessage.includes('ok') ||
        lowerMessage.includes('좋아') || lowerMessage.includes('그렇게')) {
        if (!conversationState.offerMade && !conversationState.appointmentOffered) {
            return "네, 고객님. 구체적으로 어떤 도움이 필요하신가요?<br><br>" +
                   "<strong>선택 가능한 서비스:</strong><br>" +
                   "1️⃣ 긴급출동 요청 (즉시 출동)<br>" +
                   "2️⃣ 서비스센터 예약 (익일 이후)<br>" +
                   "3️⃣ 전화 상담 연결 (기술 상담사)<br>" +
                   "4️⃣ 응급 조치 방법 안내";
        }
    }

    // 부정/거부 응답 (교착 상황)
    if (lowerMessage.includes('아니') || lowerMessage.includes('안') ||
        lowerMessage.includes('싫') || lowerMessage.includes('no')) {
        return "고객님, 다른 방법으로 도와드릴 수 있도록 하겠습니다. 어떤 부분이 불편하신가요? 구체적으로 말씀해 주시면 맞춤 해결책을 찾아드리겠습니다.";
    }

    // 감사 인사
    if (lowerMessage.includes('감사') || lowerMessage.includes('고마') ||
        lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
        return "고객님, 도움이 되었다니 다행입니다. 현대자동차를 이용해 주셔서 감사합니다.<br><br>" +
               "차량 관리에 대해 추가로 궁금하신 점이 있으시면 언제든지 1588-5000으로 연락 주시기 바랍니다.<br><br>" +
               "안전 운전하시고, 좋은 하루 되세요. 🙏";
    }

    // 기본 응답
    return "고객님, 정확한 상담을 위해 조금 더 구체적인 정보가 필요합니다.<br><br>" +
           "<div class='info-box'>" +
           "<strong>다음 정보를 알려주시면 도움이 됩니다:</strong><br>" +
           "• 경고등의 색상 (빨간색/노란색/주황색)<br>" +
           "• 경고등의 모양 (엔진, 오일, 배터리, 온도계 등)<br>" +
           "• 차량의 현재 상태 (주행 중/정차)<br>" +
           "• 느껴지는 이상 증상 (소리, 진동, 출력 저하 등)" +
           "</div>" +
           "또는 하단의 '자주 묻는 문의' 버튼을 이용해 주세요.";
}

// 메시지 전송 처리
function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';

    // 타이핑 인디케이터 표시
    showTypingIndicator();

    // 실제 챗봇처럼 1.5-2.5초 지연
    setTimeout(() => {
        removeTypingIndicator();
        const response = analyzeAndRespond(message);
        addMessage(response);
    }, 1500 + Math.random() * 1000);
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
