package com.medshare.config;

import com.medshare.web.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Guards the role-scoped API trees. Every /api/clinic/** endpoint requires a signed-in
 * CLINIC session and every /api/admin/** endpoint requires an ADMIN session.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    public static final String SESSION_USER_ID = "userId";
    public static final String SESSION_ROLE = "role";

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RoleInterceptor("CLINIC")).addPathPatterns("/api/clinic/**");
        registry.addInterceptor(new RoleInterceptor("ADMIN")).addPathPatterns("/api/admin/**");
    }

    record RoleInterceptor(String requiredRole) implements HandlerInterceptor {

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            Object userId = request.getSession(false) == null ? null : request.getSession(false).getAttribute(SESSION_USER_ID);
            Object role = request.getSession(false) == null ? null : request.getSession(false).getAttribute(SESSION_ROLE);

            if (userId == null) {
                throw ApiException.unauthorized("Not signed in. Please sign in first.");
            }
            if (!requiredRole.equals(role)) {
                throw ApiException.forbidden("This area is only for " + requiredRole + " accounts.");
            }
            return true;
        }
    }
}
