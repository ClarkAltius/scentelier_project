document.body.style.margin = "0";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.backgroundColor = "#f7f7f7";
document.body.style.padding = "30px";

// 폼 컨테이너
const container = document.createElement("div");
container.style.maxWidth = "500px";
container.style.margin = "0 auto";
container.style.backgroundColor = "#fff";
container.style.padding = "25px";
container.style.borderRadius = "8px";
container.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
document.body.appendChild(container);

// 제목
const heading = document.createElement("h2");
heading.textContent = "문의하기";
heading.style.textAlign = "center";
heading.style.marginBottom = "20px";
container.appendChild(heading);

// 유틸 함수: 입력 그룹 만들기
function createInputGroup(labelText, inputType, inputId) {
  const group = document.createElement("div");
  group.style.marginBottom = "15px";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.setAttribute("for", inputId);
  label.style.display = "block";
  label.style.fontWeight = "bold";
  label.style.marginBottom = "5px";

  let input;
  if (inputType === "textarea") {
    input = document.createElement("textarea");
    input.style.height = "100px";
    input.style.resize = "vertical";
  } else {
    input = document.createElement("input");
    input.type = inputType;
  }

  input.id = inputId;
  input.style.width = "100%";
  input.style.padding = "10px";
  input.style.borderRadius = "4px";
  input.style.border = "1px solid #ccc";

  const error = document.createElement("div");
  error.style.color = "red";
  error.style.fontSize = "14px";
  error.id = inputId + "Error";

  group.appendChild(label);
  group.appendChild(input);
  group.appendChild(error);

  return group;
}

// 입력 필드 추가
const nameGroup = createInputGroup("이름", "text", "name");
const emailGroup = createInputGroup("이메일", "email", "email");
const messageGroup = createInputGroup("메시지", "textarea", "message");

container.appendChild(nameGroup);
container.appendChild(emailGroup);
container.appendChild(messageGroup);

// 제출 버튼
const submitBtn = document.createElement("button");
submitBtn.textContent = "보내기";
submitBtn.style.backgroundColor = "#007BFF";
submitBtn.style.color = "white";
submitBtn.style.padding = "10px 20px";
submitBtn.style.border = "none";
submitBtn.style.borderRadius = "4px";
submitBtn.style.cursor = "pointer";

submitBtn.onmouseover = () => {
  submitBtn.style.backgroundColor = "#0056b3";
};
submitBtn.onmouseout = () => {
  submitBtn.style.backgroundColor = "#007BFF";
};

const buttonGroup = document.createElement("div");
buttonGroup.style.textAlign = "center";
buttonGroup.appendChild(submitBtn);

container.appendChild(buttonGroup);

// 성공 메시지
const successMessage = document.createElement("div");
successMessage.style.marginTop = "15px";
successMessage.style.fontWeight = "bold";
successMessage.style.color = "green";
successMessage.style.textAlign = "center";
container.appendChild(successMessage);

// 제출 이벤트 처리
submitBtn.addEventListener("click", () => {
  // 초기화
  successMessage.textContent = "";
  document.getElementById("nameError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("messageError").textContent = "";

  // 값 가져오기
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  let isValid = true;

  // 유효성 검사
  if (name === "") {
    document.getElementById("nameError").textContent = "이름을 입력해주세요.";
    isValid = false;
  }

  if (email === "" || !email.includes("@")) {
    document.getElementById("emailError").textContent = "올바른 이메일을 입력해주세요.";
    isValid = false;
  }

  if (message === "") {
    document.getElementById("messageError").textContent = "메시지를 입력해주세요.";
    isValid = false;
  }

  // 성공 메시지 표시
  if (isValid) {
    successMessage.textContent = "문의가 성공적으로 제출되었습니다. 감사합니다!";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
  }
});
