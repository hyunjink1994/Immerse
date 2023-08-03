package com.sandcastle.immerse.service;

import com.sandcastle.immerse.model.dto.UserDto;

public interface UserService {

    UserDto signup(UserDto userDto);
    String signin(UserDto userDto);
    UserDto getMyUser(Long userId);
    UserDto getUser(String nickname);
    boolean existsByNickname(String nickname);
    void updateUser(Long userId, UserDto userDto);
    int withdrawal(Long userId);

}
