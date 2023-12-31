package com.sandcastle.immerse.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sandcastle.immerse.model.dto.show.ShowListResponse;
import com.sandcastle.immerse.model.dto.show.ShowRequest;
import com.sandcastle.immerse.model.dto.show.ShowResponse;
import com.sandcastle.immerse.model.entity.ShowEntity;
import com.sandcastle.immerse.model.entity.UserEntity;
import com.sandcastle.immerse.model.enums.ShowProgress;
import com.sandcastle.immerse.repository.CategoryRepository;
import com.sandcastle.immerse.repository.ShowRepository;
import com.sandcastle.immerse.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ShowServiceImpl implements ShowService {

	private final CategoryRepository categoryRepository;
	private final UserRepository userRepository;
	private final ShowRepository showRepository;

	public List<ShowListResponse> getShows() {
		List<ShowEntity> shows = showRepository.findAll();
		return shows.stream().map(ShowListResponse::new).collect(Collectors.toList());
	}

	public List<ShowListResponse> findShowsByCategory(Long categoryId) {
		List<ShowEntity> shows = showRepository.findByCategory(categoryId);
		return shows.stream().map(ShowListResponse::new).collect(Collectors.toList());
	}

	@Override
	public List<ShowListResponse> findShowsByUser(Long userId) {
		return null;
	}

	public Optional<ShowResponse> findShow(Long id) {
		ShowEntity show = showRepository.findById(id).orElse(null);

		if (show == null) return Optional.empty();

		ShowResponse res = ShowResponse.builder()
			.title(show.getTitle())
			.showId(show.getShowId())
			.startTime(show.getStartTime())
			.endTime(show.getEndTime())
			.date(show.getDate())
			.description(show.getDescription())
			.thumbnail(show.getThumbnail())
			.attendanceLimit(show.getAttendanceLimit())
			.maxAttendance(show.getMaxAttendance())
			.showProgress(show.getShowProgress())
			.category_id(show.getCategory().getCategoryId())
			.user_id(show.getUser().getUserId())
			.nickname((show.getUser().getNickname()))
			.build();
		return Optional.of(res);
	}

	@Transactional
	public Long postShow(ShowRequest req) {

		UserEntity user = userRepository.findById(req.getUserId())
			.orElseThrow(() -> new IllegalArgumentException("does not exist!"));

		ShowEntity show = ShowEntity.builder()
			.title(req.getTitle())
			.startTime(req.getStartTime())
			.endTime(req.getEndTime())
			.date(req.getDate())
			.description(req.getDescription())
			.thumbnail(req.getThumbnail())
			.price(req.getPrice())
			.attendanceLimit(req.getAttendanceLimit())
			.showProgress(ShowProgress.SCHEDULED)
			.category(categoryRepository.getReferenceById(req.getCategoryId()))
			.user(user)
			.build();
		return showRepository.save(show).getShowId();
	}

	@Transactional
	public Long putShow(Long showId, ShowRequest req) {
		ShowEntity current_show = showRepository.findById(showId)
			.orElseThrow(() -> new IllegalArgumentException("does not exist!"));

		ShowEntity show = ShowEntity.builder()
			.showId(showId)
			.title(req.getTitle())
			.startTime(req.getStartTime())
			.endTime(req.getEndTime())
			.date(req.getDate())
			.description(req.getDescription())
			.thumbnail(req.getThumbnail())
			.price(req.getPrice())
			.attendanceLimit(req.getAttendanceLimit())
			.maxAttendance(current_show.getMaxAttendance())
			.showProgress(current_show.getShowProgress())
			.category(categoryRepository.getReferenceById(req.getCategoryId()))
			.user(userRepository.getReferenceById(req.getUserId()))
			.build();
		return showRepository.save(show).getShowId();
	}

	@Override
	@Transactional
	public Long updateMaxAttendance(Long showId, Long userId, int count) throws IllegalArgumentException {
		ShowEntity show = showRepository.findById(showId)
				.orElseThrow(() -> new IllegalArgumentException("No Show!"));

		if (userId != show.getUser().getUserId()) { // 공연자 자신이 아니라면
			throw new IllegalArgumentException("User is not the Artist of the show!");
		}
		show.setMaxAttendance(count);

		return show.getShowId();
	}

	@Override
	@Transactional
	public Long startShow(Long showId, Long userId) throws IllegalStateException, IllegalArgumentException {
		ShowEntity show = showRepository.findById(showId)
				.orElseThrow(() -> new IllegalArgumentException("No Show!"));

		log.trace("show: " + show.getShowId());

		if (userId != show.getUser().getUserId()) { // 공연자 자신이 아니라면
			throw new IllegalArgumentException("User is not the Artist of the show!");
		}
		show.begin();

		return show.getShowId();
	}

	@Override
	@Transactional
	public Long finishShow(Long showId, Long userId) throws IllegalStateException, IllegalArgumentException {
		ShowEntity show = showRepository.findById(showId)
				.orElseThrow(() -> new IllegalArgumentException("No show!"));
		if (userId != show.getUser().getUserId()) { // 공연자 자신이 아니라면
			throw new IllegalArgumentException("User is not the Artist of the show!");
		}
		show.end();

		return show.getShowId();
	}

	/**
	 * 공연중인 것중 인기순 20개 조회
	 * @return
	 */
	@Transactional
	public List<ShowListResponse> getShowsOrderByProgress() {
		List<ShowEntity> shows = showRepository.findAllShowsOrderByProgress();
		return shows.stream().map(ShowListResponse::new).collect(Collectors.toList());
	}

	/**
	 * 예약중인 공연 중 인기순 20개 조회
	 * @return
	 */
	@Transactional
	public List<ShowListResponse> getShowsOrderByReservation() {
		List<ShowEntity> shows = showRepository.getShowsOrderByReservation();
		return shows.stream().map(ShowListResponse::new).collect(Collectors.toList());
	}

}
