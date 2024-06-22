const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const levelBoard = document.getElementById('levelBoard');
const scoreBoard = document.getElementById('scoreBoard');
let score = parseInt(scoreBoard.textContent, 10) || 0;
const ctx = canvas.getContext('2d');
const N = 26; // 게임판 사이즈
const blockSize = canvas.height / N; // 단위 블록
const start = false;

let maps = Array.from({ length: N }, () => Array(N).fill(0)); // 게임 필드
let direction = [1, 0]; // 처음 방향
let bodyQueue = [{ x: 1, y: 1 }];  // 처음 뱀 위치
let apples = []; // 사과 위치 튜플(배열) 요소 이중배열 -> 레벨이 높아지면 사과를 여러 개 배치하는 로직으로 재활용도 가능할듯
let level = 1; // 레벨 변수
let moveInterval = 50; // 점수 계산용 움직임 간격 초기화 변수

// 랜덤한 위치에 사과 배치
function placeApple() {
    let appleX, appleY;
    let validPosition = false;

    // 사과가 뱀 몸통에 배치되지 않도록
    while (!validPosition) {
        appleX = Math.floor(Math.random() * N);
        appleY = Math.floor(Math.random() * N);

        validPosition = maps[appleX][appleY] === 0;
    }

    apples.push({ x: appleX, y: appleY });
    maps[appleX][appleY] = 2;  // 사과 === 2
}

// 초기 사과 배치
placeApple();

// 이런 게 있다네... 신기하네...
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = 'green';
    for (let { x, y } of bodyQueue) {
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }

    // Draw apples
    ctx.fillStyle = 'red';
    for (let { x, y } of apples) {
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
}

// Initial draw
maps[1][1] = 1;
draw();

// 게임 함수
function game() {
    // 분기 시작
    let { x, y } = bodyQueue[0]; // 뱀 대가리 뽑기

    // 나아갈 위치 조정
    x += direction[0];
    y += direction[1];

    // 게임 오버 조건
    // 1. 맵 밖(벽)으로 향한다
    // 2. 자기 몸(1)이랑 부딪힌다
    if (x < 0 || x >= N || y < 0 || y >= N || maps[x][y] === 1) {
        alert(`Game Over!\n\n진행 레벨: ${level} 단계\n최종 점수: ${score} 점\n게임을 초기화합니다`);
        location.reload();

        //todo: 여기다가 게임 재시작, 점수 환산 및 저장 로직 함수

        // return;
    }

    // 사과를 먹었는지?
    let ateApple = false;

    // 현재는 레벨마다 사과가 계속 1개씩만 배치
    for (let i = 0; i < apples.length; i++) {
        // 대가리 위치가 사과 위치랑 같다면?
        if (apples[i].x === x && apples[i].y === y) {
            // 사과 먹었고
            ateApple = true;
            // 해당 사과 먹은 처리
            apples.splice(i, 1);
            // 새로운 사과 배치
            placeApple();
            // 레벨 업
            level++;
            levelBoard.textContent = level;
            // 점수 계산 및 움직임 간격 초기화
            score += moveInterval * 2;
            scoreBoard.textContent = score.toString().padStart(5, '0');
            moveInterval = 50;

            break;
        }
    }

    // Update snake's body
    bodyQueue.unshift({ x, y });
    maps[x][y] = 1;

    if (!ateApple) {
        let tail = bodyQueue.pop();
        maps[tail.x][tail.y] = 0;
    }

    // 위에서 업뎃된 정보들 바탕으로 캔버스 다시 드로잉
    draw();

    // 점수 계산용 움직임 포인트 업데이트
    if (moveInterval === 0) {
        moveInterval = 0;
    } else {
        moveInterval--;
    }

    // 분기 단위시간 조정(줄일 수록 빡세겠지)
    // 60, hard는 45
    setTimeout(game, 55);
}

// 게임 시작~
startBtn.addEventListener("click", () => {
    game();
    startBtn.disabled = true;
    startBtn.textContent = "EAT APPLE !";
}
)

// 방향키 조정해서 나아갈 방향 업뎃
document.addEventListener('keydown', (event) => {
    let newDirection;

    switch (event.key) {
        case 'ArrowLeft':
            newDirection = [-1, 0];
            break;
        case 'ArrowRight':
            newDirection = [1, 0];
            break;
        case 'ArrowUp':
            newDirection = [0, -1];
            break;
        case 'ArrowDown':
            newDirection = [0, 1];
            break;
    }

    // 진행 방향의 정반대 방향으로는 못 가게
    if (newDirection) {
        const [dx, dy] = direction;
        const [ndx, ndy] = newDirection;

        if (!(dx === -ndx && dy === -ndy)) {
            direction = newDirection;
        }
    }
});
