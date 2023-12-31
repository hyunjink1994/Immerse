package com.sandcastle.immerse.service;

import com.sandcastle.immerse.model.dto.UserDto;

public interface UserService {

    void signup(UserDto userDto);
    String signin(UserDto userDto);
    UserDto getMyUser(Long userId);

//    UserDto getUser(Long userId);

    UserDto getUser(String nickname);
    boolean existsByNickname(String nickname);

    boolean existsByEmail(String email);
    void updateUser(Long userId, UserDto userDto);
    int withdrawal(Long userId);

}
