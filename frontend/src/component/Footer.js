// src/component/Footer.js
import React from "react";

function Footer() {
    return (
        <footer
            style={{
                backgroundColor: "#e9e9e933",
                color: "#4b3e2a",
                padding: "50px 0 20px 0",
                fontFamily: "'Nanum Myeongjo', serif",
                borderTop: "1px solid #e0e0e0ff",
                borderBottom: "1px solid #ddddddff",
                marginTop: "100px"
            }}
        >
            {/* 메인 Footer 영역 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 2fr 1.5fr",
                    gap: "40px",
                    width: "80%",
                    margin: "0 auto",
                    textAlign: "left",
                }}
            >
                {/* 1️⃣ 로고 섹션 */}
                <div>
                    <h1
                        style={{
                            fontFamily: "'Gowun Batang', serif",
                            fontSize: "3rem",
                            color: "#000000ff",
                            marginBottom: "10px",
                        }}
                    >
                        Scentelier
                    </h1>
                    <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
                        Find your signature scent<br />
                        and express your true self.
                    </p>
                </div>

                {/* 2️⃣ 회사 정보 */}
                <div>
                    <h4
                        style={{
                            fontFamily: "'Gowun Batang', serif",
                            fontSize: "1.1rem",
                            marginBottom: "12px",
                            color: "#2b2b2bff",
                        }}
                    >
                        Company Info
                    </h4>
                    <p style={{ lineHeight: "1.8", fontSize: "0.9rem" }}>
                        상호명: Scentelier <br />
                        대표:  <br />
                        주소: 서울특별시 강남구 향기대로 77 <br />
                        사업자등록번호: 629-81-0000 <br />
                        통신판매신고번호: 2025-0000-02645
                    </p>
                </div>

                {/* 3️⃣ 고객센터 */}
                <div>
                    <h4
                        style={{
                            fontFamily: "'Gowun Batang', serif",
                            fontSize: "1.1rem",
                            marginBottom: "12px",
                            color: "#2b2b2bff",
                        }}
                    >
                        Customer Center
                    </h4>
                    <p style={{ lineHeight: "1.8", fontSize: "0.9rem" }}>
                        ☎ 02-0000-0000 <br />
                        업무 시간: 월–금 10:00 ~ 17:00 <br />
                        휴무: 주말 및 공휴일
                    </p>
                </div>

                {/* 4️⃣ 이용안내 */}
                <div>
                    <h4
                        style={{
                            fontFamily: "'Gowun Batang', serif",
                            fontSize: "1.1rem",
                            marginBottom: "12px",
                            color: "#2b2b2bff",
                        }}
                    >
                        이용안내
                    </h4>
                    <ul style={{ listStyle: "none", padding: 0, lineHeight: "1.8" }}>
                        <li><a href="#" style={linkStyle}>이용약관</a></li>
                        <li><a href="#" style={linkStyle}>개인정보처리방침</a></li>
                        <li><a href="#" style={linkStyle}>반품 및 환불 규정</a></li>
                    </ul>
                </div>
            </div>

            {/* 하단 라인 & 카피라이트 */}
            <div
                style={{
                    marginTop: "40px",
                    borderTop: "1px solid #cacacaff",
                    paddingTop: "15px",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    opacity: 0.7,
                }}
            >
                © {new Date().getFullYear()} Scentelier. All rights reserved.
            </div>
        </footer>
    );
}

// 링크 스타일 공통 정의
const linkStyle = {
    color: "#464646ff",
    textDecoration: "none",
    fontSize: "0.9rem",
};
export default Footer;
