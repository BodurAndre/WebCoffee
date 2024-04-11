package org.example.server.controllers;


import org.example.server.models.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.example.server.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("")
public class AuthController {
    private final UserService userService;


    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @RequestMapping(value = "/register",method = RequestMethod.GET)
    public String register(Model model){
        User user = new User();
        model.addAttribute("user",user);
        return "register";
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public String createNewUser(HttpServletRequest request, @ModelAttribute("user") User user) {
        try {
            user.setRole("USER");
            user.setProfile("Public");
            user.setProfilePhotoUrl("false");
            user.setFileName("standart_profile.png");
            if (userService.findUser(user.getEmail())) {
                return "redirect:/register?error=email_exists";
            }
            User newUser = userService.createUser(user);
            if (newUser == null) {
                return "redirect:/register?error=email_exists&email=" + user.getEmail();
            }
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(authentication);
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
            return "redirect:/";

        } catch (Exception e) {
            return "redirect:/register?error=";
        }
    }


    @RequestMapping(value = "/login",method = RequestMethod.GET)
    public String login(){
        return "login";
    }

    @RequestMapping(value = "/logout",method = RequestMethod.GET)
    public String logout(HttpServletRequest request) {
        HttpSession session = request.getSession();
        session.invalidate();
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(null);
        return "redirect:/login";
    }

}