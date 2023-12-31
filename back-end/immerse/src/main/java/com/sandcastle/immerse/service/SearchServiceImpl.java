package com.sandcastle.immerse.service;

import com.sandcastle.immerse.exception.AppException;
import com.sandcastle.immerse.exception.ErrorCode;
import com.sandcastle.immerse.model.dto.SearchDto;
import com.sandcastle.immerse.model.dto.UserDto;
import com.sandcastle.immerse.model.dto.show.ShowListResponse;
import com.sandcastle.immerse.model.entity.SearchEntity;
import com.sandcastle.immerse.model.entity.ShowEntity;
import com.sandcastle.immerse.model.entity.UserEntity;
import com.sandcastle.immerse.repository.SearchRepository;
import com.sandcastle.immerse.repository.ShowRepository;
import com.sandcastle.immerse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {
    private final SearchRepository searchRepository;
    private final UserRepository userRepository;
    private final ShowRepository showRepository;

    @Override
    @Transactional
    public void saveSearch(Long userId, SearchDto searchDto) {

        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> {
                    return new AppException(ErrorCode.USERID_NOT_FOUND, userId + "은(는) 존재하지 않는 고유번호 입니다.");
                });

        SearchEntity searchEntity = SearchEntity.builder()
                .searchTime(searchDto.getSearchTime())
                .searchContent(searchDto.getSearchContent())
                .userEntity(userEntity)
                .build();

        searchRepository.save(searchEntity);
    }

    @Override
    @Transactional
    public List<SearchDto> findAllMySearchHistories(Long userId) {

        List<SearchEntity> searchEntityList = searchRepository.findAllByUserEntity_UserId(userId);

        List<SearchDto> searchDtoList = new ArrayList<>();

        for (SearchEntity se: searchEntityList) {
            SearchDto searchDto = SearchDto.builder()
                    .searchTime(se.getSearchTime())
                    .searchContent(se.getSearchContent())
                    .build();

            searchDtoList.add(searchDto);
        }

        return searchDtoList;
    }

    @Override
    @Transactional
    public List<UserDto> findAllUsersContainContent(String content) {

        List<UserEntity> userEntityList = userRepository.findByNicknameContains(content);

        List<UserDto> userDtoList = new ArrayList<>();

        for (UserEntity ue: userEntityList) {
            UserDto userDto = UserDto.builder()
                    .userId(ue.getUserId())
                    .email(ue.getEmail())
                    .nickname(ue.getNickname())
                    .gender(ue.getGender())
                    .name(ue.getName())
                    .phoneNumber(ue.getPhoneNumber())
                    .profilePicture(ue.getProfilePicture())
                    .bannerPicture(ue.getBannerPicture())
                    .selfDescription(ue.getSelfDescription())
                    .build();

            userDtoList.add(userDto);
        }

        return userDtoList;
    }

    @Override
    @Transactional
    public List<ShowListResponse> findAllShowsContainContent(String content) {

        List<ShowEntity> showEntityList = showRepository.findByTitleContains(content);

        return showEntityList.stream().map(ShowListResponse::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ShowListResponse> findAllShowsContainTag(String content) {

        return null;
    }

}
