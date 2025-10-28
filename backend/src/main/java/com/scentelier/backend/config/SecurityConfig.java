package com.scentelier.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scentelier.backend.dto.UserResponseDto;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


//BCryptPasswordEncoder 사용
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    //로그인 과정에서 사용할 bean 정의
    //return 되는 것은 PasswordEncoder 인스턴스

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, UserRepository userRepository, ObjectMapper objectMapper) throws Exception{
        http
                //CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                //CSRF 비활성화
                .csrf(csrf->csrf.disable())
                //권한부여 규칙 설정
                .authorizeHttpRequests(authz ->authz
                                .requestMatchers("/member/login","/signup").permitAll()
                               .requestMatchers("/", "/product/list", "/product/detail/**", "/images/**","/uploads/**", "/order", "/order/**", "/cart/**","/api/customPerfume/**","/api/perfume/**").permitAll()
                                .requestMatchers("/api/test/my-roles", "/payments").authenticated() // Needs login, but no admin role
                        
                                // 관리자 전용 엔드포인트
                                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                                .anyRequest().authenticated()
                    )

                //폼 로그인 설정
                .formLogin(formLogin->formLogin
                        .loginProcessingUrl("/member/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> {
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            //기본 핸들러. 나중에 커스텀 핸들러 추가
                            response.setStatus(200);
                            //로그인한 유저 이메일 가져오기
                            String email = ((User) authentication.getPrincipal()).getUsername();

                            //유저의 정보 전체 가져오기
                            Optional<Users> userOptional = userRepository.findByEmail(email);
                            Map<String, Object> responseData = new HashMap<>();
                            responseData.put("message", "success");

                            if(userOptional.isPresent()){
                                Users user = userOptional.get();

                                UserResponseDto dto = new UserResponseDto(
                                        user.getId(),
                                        user.getEmail(),
                                        user.getUsername(),
                                        user.getRole(),
                                        user.getAddress(),
                                        user.getPhone()
                                );

                                responseData.put("member", dto);
                            } else {
                                responseData.put("member", null);
                            }

                            // JSON 스트링으로 맵 작성
                            response.getWriter().write(objectMapper.writeValueAsString(responseData));
                            response.getWriter().flush();
                        })
                                .failureHandler((request, response, exception) -> {
                                    // Basic failure response for API testing
                                    response.setCharacterEncoding("UTF-8");
                                    response.setStatus(401); // Unauthorized
                                    response.getWriter().write("{\"message\": \"로그인 실패: " + exception.getMessage() + "\"}");
                                    response.getWriter().flush();
                                })

                                .permitAll() // 로그인 관련 url에 접근 허용하기
                )// 예외 처리 설정
                .exceptionHandling(exceptions -> exceptions
                        // 인증되지 않은 사용자가 보호된 리소스에 접근하려 할 때
                        // 로그인 페이지로 리디렉션하는 대신 401 Unauthorized 상태 코드를 반환.
                        // (SPA/API 클라이언트(React)에 적합한 방식)
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Allow frontend origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")); // Allow common methods
        configuration.setAllowedHeaders(Arrays.asList("*")); // 모든 헤더 허용
        configuration.setAllowCredentials(true); // Allow credentials (cookies, auth headers)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply CORS to all paths
        return source;

    }

}
