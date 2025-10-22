// 마이페이지 정보를 담을 객체
const userInfo = {
  name: "홍길동",
  email: "hong@example.com",
  address: "서울특별시"
};

// 기본 스타일 추가
document.body.style.fontFamily = 'Arial, sans-serif';
document.body.style.backgroundColor = '#f5f5f5';
document.body.style.display = 'flex';
document.body.style.justifyContent = 'center';
document.body.style.alignItems = 'center';
document.body.style.height = '100vh';
document.body.style.margin = '0';

// 루트 컨테이너 만들기
const container = document.createElement('div');
container.style.backgroundColor = '#fff';
container.style.padding = '40px';
container.style.borderRadius = '10px';
container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
container.style.width = '400px';
container.style.boxSizing = 'border-box';

// 제목
const title = document.createElement('h2');
title.textContent = "마이페이지";
title.style.fontSize = '28px';
title.style.marginBottom = '30px';
title.style.textAlign = 'center';
container.appendChild(title);

// 정보 표시 함수
function createInfo(labelText, valueText, id) {
  const infoDiv = document.createElement('div');
  infoDiv.style.marginBottom = '20px';

  const label = document.createElement('label');
  label.textContent = labelText;
  label.htmlFor = id;
  label.style.display = 'block';
  label.style.fontWeight = 'bold';
  label.style.marginBottom = '5px';
  infoDiv.appendChild(label);

  const span = document.createElement('span');
  span.id = id;
  span.style.display = 'block';
  span.style.fontSize = '16px';
  span.style.padding = '10px';
  span.style.border = '1px solid #ccc';
  span.style.borderRadius = '5px';
  span.style.backgroundColor = '#fafafa';
  infoDiv.appendChild(span);

  span.textContent = valueText;

  return infoDiv;
}

// 이름, 이메일, 주소 표시
container.appendChild(createInfo("이름", userInfo.name, "name"));
container.appendChild(createInfo("이메일", userInfo.email, "email"));
container.appendChild(createInfo("주소", userInfo.address, "address"));

// 버튼들 담을 div
const buttonDiv = document.createElement('div');
buttonDiv.style.marginTop = '30px';
buttonDiv.style.display = 'flex';
buttonDiv.style.justifyContent = 'space-between';

// 버튼 스타일 공통 함수
function styleButton(button, bgColor) {
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.color = '#fff';
  button.style.backgroundColor = bgColor;
  button.onmouseover = () => button.style.opacity = '0.9';
  button.onmouseout = () => button.style.opacity = '1';
}

// 수정 버튼
const editBtn = document.createElement('button');
editBtn.textContent = "수정";
styleButton(editBtn, '#67AB9F'); // 초록색
editBtn.onclick = () => {
  const newName = prompt("이름을 입력하세요", userInfo.name);
  if (newName !== null) {
    userInfo.name = newName;
    document.getElementById('name').textContent = newName;
  }

  const newEmail = prompt("이메일을 입력하세요", userInfo.email);
  if (newEmail !== null) {
    userInfo.email = newEmail;
    document.getElementById('email').textContent = newEmail;
  }

  const newAddress = prompt("주소를 입력하세요", userInfo.address);
  if (newAddress !== null) {
    userInfo.address = newAddress;
    document.getElementById('address').textContent = newAddress;
  }
};
buttonDiv.appendChild(editBtn);

// 탈퇴 버튼
const deleteBtn = document.createElement('button');
deleteBtn.textContent = "탈퇴";
styleButton(deleteBtn, '#f44336'); // 빨간색
deleteBtn.onclick = () => {
  if (confirm("정말 탈퇴하시겠습니까?")) {
    alert("탈퇴 완료되었습니다.");
    userInfo.name = "";
    userInfo.email = "";
    userInfo.address = "";
    document.getElementById('name').textContent = "";
    document.getElementById('email').textContent = "";
    document.getElementById('address').textContent = "";
  }
};
buttonDiv.appendChild(deleteBtn);

container.appendChild(buttonDiv);

// 페이지 body에 붙이기
document.body.appendChild(container);