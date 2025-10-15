# scentelier_project

OpenAPI 및 MVC 모델을 활용한 커스텀 향수 재고관리 프로그램

풀스택 개발을 위한 기술 일람

백엔드
- 프레임워크 : Spring Boot
- 언어 : Java 17
- 데이타베이스 : MySQL
- ORM : Spring Data JPA / Hibernate
- 보안 : Spring Security
- 빌드 툴 : Maven

프론트엔드
- 라이브러리 : React
- UI 프레임워크 : React Bootstrap & Bootstrap
- 라우팅 : React Router Dom
- HTTP 클라이언트 : Axios
- 패키지 매니저 : npm

프로젝트 구성
이 레포지토리에는 두개의 메인 경로가 있습니다./

├── backend/      # Spring Boot 애플리케이션 소스

└── frontend/     # 리액트 애플리케이션 소스


개발 도구
- Java JDK 17
- MySQL 서버
- Node.js
- IntelliJ IDEA
- Visual Studio Code
- MySQL Workbench


--------------------------
--- 개발 환경 설정하기 ---
--------------------------

.[1]
데이타베이스 구성

백엔드 실행 전 다음 데이타베이스가 필요합니다
1. MySQL Workbench 실행
2. 다음 쿼리 실행
```
CREATE DATABASE scentelier;
```

.[2] 레포지토리 클론, 백엔드 설정

cmd에서 다음 커맨드를 실행해주세요

```
git clone https://github.com/ClarkAltius/scentelier.git
```
```
cd scentelier
```

.[3]
백엔드-데이터베이스 연결 설정 및 실행

IntelliJ 프로그램으로 프로젝트를 실행하고 다음 파일을 찾아가주세요
backend/src/main/resources/application.properties

application.properties 파일에서 
```
spring.datasource.username=your-mysql-username
spring.datasource.password=your-mysql-password
```

부분의 'your-mysql-username' 과 'your-mysql-password'를 여러분이 사용하고 있는 아이디와 비밀번호로 바꿔주세요.

'개별경로/scentelier\backend\src\main\java\com\scentelier\backend\BackendApplication.java`
파일을 IntelliJ에서 실행해주세요. http://localhost:9000 으로 실행되면 성공입니다!

.[4]
프론트엔드 설정

cmd 창을 열어 frontend 폴더로 찾아가주세요. 

다음 커맨드를 실행해주세요

```
npm install axios reactor-router-dom bootstrap react-bootstrap
```
```
npm start
```

필요한 모든 npm 패키지를 설치하고 http://localhost:3000 의 주소로 인터넷 브라우저가 실행되면 성공입니다!
