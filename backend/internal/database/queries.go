package database

import (
	"fmt"
	"strings"
	"time"

	"github.com/biggboss/pulse/internal/models"
)

// ============================================================
// SHOWS
// ============================================================

// GetShows fetches all active shows ordered by display_order
func GetShows() ([]models.Show, error) {
	ctx, cancel := Q()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		SELECT id, slug, name, language, broadcaster, host_name,
		       COALESCE(logo_url,''), COALESCE(banner_url,''),
		       accent_color, is_active, display_order, created_at
		FROM shows
		ORDER BY display_order ASC, created_at ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("GetShows query: %w", err)
	}
	defer rows.Close()

	var shows []models.Show
	for rows.Next() {
		var s models.Show
		if err := rows.Scan(&s.ID, &s.Slug, &s.Name, &s.Language, &s.Broadcaster,
			&s.HostName, &s.LogoURL, &s.BannerURL, &s.AccentColor, &s.IsActive,
			&s.DisplayOrder, &s.CreatedAt); err != nil {
			return nil, fmt.Errorf("GetShows scan: %w", err)
		}
		shows = append(shows, s)
	}
	return shows, rows.Err()
}

// GetShowBySlug returns a show by its slug (supports both 'telugu' and 'bigg-boss-telugu')
func GetShowBySlug(slug string) (*models.Show, error) {
	ctx, cancel := Q()
	defer cancel()

	var s models.Show
	// Try exact match first, then with 'bigg-boss-' prefix
	err := DB.QueryRowContext(ctx, `
		SELECT id, slug, name, language, broadcaster, host_name,
		       COALESCE(logo_url,''), COALESCE(banner_url,''),
		       accent_color, is_active, display_order, created_at
		FROM shows WHERE slug = $1 OR slug = $2 OR slug = $3
		LIMIT 1
	`, slug, "bigg-boss-"+slug, strings.TrimPrefix(slug, "bigg-boss-")).Scan(
		&s.ID, &s.Slug, &s.Name, &s.Language, &s.Broadcaster,
		&s.HostName, &s.LogoURL, &s.BannerURL, &s.AccentColor, &s.IsActive,
		&s.DisplayOrder, &s.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("GetShowBySlug: %w", err)
	}
	return &s, nil
}

// CreateShow inserts a new show
func CreateShow(s models.Show) (*models.Show, error) {
	ctx, cancel := Q()
	defer cancel()

	err := DB.QueryRowContext(ctx, `
		INSERT INTO shows (slug, name, language, broadcaster, host_name, logo_url, banner_url, accent_color, is_active, display_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id, slug, name, language, broadcaster, host_name,
		          COALESCE(logo_url,''), COALESCE(banner_url,''),
		          accent_color, is_active, display_order, created_at
	`, s.Slug, s.Name, s.Language, s.Broadcaster, s.HostName,
		s.LogoURL, s.BannerURL, s.AccentColor, s.IsActive, s.DisplayOrder,
	).Scan(&s.ID, &s.Slug, &s.Name, &s.Language, &s.Broadcaster,
		&s.HostName, &s.LogoURL, &s.BannerURL, &s.AccentColor, &s.IsActive,
		&s.DisplayOrder, &s.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("CreateShow: %w", err)
	}
	return &s, nil
}

// UpdateShow updates a show
func UpdateShow(s models.Show) error {
	return Exec(`
		UPDATE shows SET name=$1, language=$2, broadcaster=$3, host_name=$4,
		    logo_url=$5, banner_url=$6, accent_color=$7, is_active=$8, display_order=$9,
		    updated_at=NOW()
		WHERE id=$10
	`, s.Name, s.Language, s.Broadcaster, s.HostName,
		s.LogoURL, s.BannerURL, s.AccentColor, s.IsActive, s.DisplayOrder, s.ID)
}

// ============================================================
// SEASONS
// ============================================================

func GetSeasonsByShow(showID string) ([]models.Season, error) {
	ctx, cancel := Q()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		SELECT id, show_id, season_number, title, COALESCE(tagline,''), year, status,
		       COALESCE(total_contestants,0), COALESCE(remaining_contestants,0), created_at
		FROM seasons WHERE show_id = $1
		ORDER BY season_number DESC
	`, showID)
	if err != nil {
		return nil, fmt.Errorf("GetSeasonsByShow: %w", err)
	}
	defer rows.Close()

	var seasons []models.Season
	for rows.Next() {
		var s models.Season
		var showIDStr string
		if err := rows.Scan(&s.ID, &showIDStr, &s.SeasonNumber, &s.Title, &s.Tagline,
			&s.Year, &s.Status, &s.TotalContestants, &s.RemainingContestants, &s.CreatedAt); err != nil {
			return nil, fmt.Errorf("GetSeasonsByShow scan: %w", err)
		}
		s.ShowID = showIDStr
		seasons = append(seasons, s)
	}
	return seasons, rows.Err()
}

func GetSeasonBySlugAndNumber(showSlug string, seasonNum int) (*models.Season, error) {
	ctx, cancel := Q()
	defer cancel()

	var s models.Season
	err := DB.QueryRowContext(ctx, `
		SELECT se.id, se.show_id, sh.slug, se.season_number, se.title, COALESCE(se.tagline,''),
		       se.year, se.status, COALESCE(se.total_contestants,0),
		       COALESCE(se.remaining_contestants,0), se.created_at
		FROM seasons se
		JOIN shows sh ON sh.id = se.show_id
		WHERE (sh.slug = $1 OR sh.slug = $2 OR sh.slug = $3) AND se.season_number = $4
	`, showSlug, "bigg-boss-"+showSlug, strings.TrimPrefix(showSlug, "bigg-boss-"), seasonNum,
	).Scan(&s.ID, &s.ShowID, &s.ShowSlug, &s.SeasonNumber, &s.Title, &s.Tagline,
		&s.Year, &s.Status, &s.TotalContestants, &s.RemainingContestants, &s.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("GetSeasonBySlugAndNumber: %w", err)
	}
	return &s, nil
}

func CreateSeason(showID string, req models.AdminCreateSeasonRequest) (*models.Season, error) {
	ctx, cancel := Q()
	defer cancel()

	var s models.Season
	err := DB.QueryRowContext(ctx, `
		INSERT INTO seasons (show_id, season_number, title, tagline, year, status)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id, show_id, season_number, title, COALESCE(tagline,''), year, status,
		          COALESCE(total_contestants,0), COALESCE(remaining_contestants,0), created_at
	`, showID, req.SeasonNumber, req.Title, req.Tagline, req.Year, req.Status,
	).Scan(&s.ID, &s.ShowID, &s.SeasonNumber, &s.Title, &s.Tagline,
		&s.Year, &s.Status, &s.TotalContestants, &s.RemainingContestants, &s.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("CreateSeason: %w", err)
	}
	s.ShowSlug = req.ShowSlug
	return &s, nil
}

// ============================================================
// CONTESTANTS
// ============================================================

func GetContestantsBySeason(seasonID string) ([]models.Contestant, error) {
	ctx, cancel := Q()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		SELECT id, season_id, name, COALESCE(native_name,''), slug,
		       COALESCE(photo_url,''), COALESCE(bio,''), COALESCE(occupation,''),
		       COALESCE(city,''), COALESCE(instagram_handle,''),
		       status, entry_type, COALESCE(nominations_count,0)
		FROM contestants WHERE season_id = $1
		ORDER BY name ASC
	`, seasonID)
	if err != nil {
		return nil, fmt.Errorf("GetContestantsBySeason: %w", err)
	}
	defer rows.Close()

	var list []models.Contestant
	for rows.Next() {
		var c models.Contestant
		if err := rows.Scan(&c.ID, &c.SeasonID, &c.Name, &c.NativeName, &c.Slug,
			&c.PhotoURL, &c.Bio, &c.Occupation, &c.City, &c.InstagramHandle,
			&c.Status, &c.EntryType, &c.NominationsCount); err != nil {
			return nil, fmt.Errorf("GetContestantsBySeason scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func CreateContestant(req models.AdminCreateContestantRequest) (*models.Contestant, error) {
	ctx, cancel := Q()
	defer cancel()

	if req.Status == "" {
		req.Status = "in_house"
	}
	if req.EntryType == "" {
		req.EntryType = "original"
	}
	if req.PhotoURL == "" {
		req.PhotoURL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
	}

	slug := slugify(req.Name)

	var c models.Contestant
	err := DB.QueryRowContext(ctx, `
		INSERT INTO contestants (season_id, name, native_name, slug, photo_url, bio, occupation, city, instagram_handle, status, entry_type)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id, season_id, name, COALESCE(native_name,''), slug,
		          COALESCE(photo_url,''), COALESCE(bio,''), COALESCE(occupation,''),
		          COALESCE(city,''), COALESCE(instagram_handle,''), status, entry_type, 0
	`, req.SeasonID, req.Name, req.NativeName, slug, req.PhotoURL, req.Bio,
		req.Occupation, req.City, req.InstagramHandle, req.Status, req.EntryType,
	).Scan(&c.ID, &c.SeasonID, &c.Name, &c.NativeName, &c.Slug,
		&c.PhotoURL, &c.Bio, &c.Occupation, &c.City, &c.InstagramHandle,
		&c.Status, &c.EntryType, &c.NominationsCount)
	if err != nil {
		return nil, fmt.Errorf("CreateContestant: %w", err)
	}
	return &c, nil
}

func UpdateContestantStatus(id, status string) error {
	return Exec(`UPDATE contestants SET status=$1, updated_at=NOW() WHERE id=$2`, status, id)
}

func DeleteContestant(id string) error {
	return Exec(`DELETE FROM contestants WHERE id=$1`, id)
}

func UpdateContestant(c models.Contestant) error {
	return Exec(`
		UPDATE contestants SET
		  name=$1, native_name=$2, photo_url=$3, bio=$4, occupation=$5,
		  city=$6, instagram_handle=$7, status=$8, entry_type=$9,
		  updated_at=NOW()
		WHERE id=$10
	`, c.Name, c.NativeName, c.PhotoURL, c.Bio, c.Occupation,
		c.City, c.InstagramHandle, c.Status, c.EntryType, c.ID)
}

// ============================================================
// NOMINATION WEEKS
// ============================================================

func GetActivePollBySeason(seasonID string) (*models.NominationWeek, error) {
	ctx, cancel := Q()
	defer cancel()

	var w models.NominationWeek
	err := DB.QueryRowContext(ctx, `
		SELECT id, season_id, week_number, title, COALESCE(description,''),
		       starts_at, ends_at, is_active, is_closed,
		       official_eviction_announced, COALESCE(official_evicted_contestant_id::text,''),
		       total_votes
		FROM nomination_weeks
		WHERE season_id=$1 AND is_active=TRUE AND is_closed=FALSE
		ORDER BY week_number DESC LIMIT 1
	`, seasonID).Scan(
		&w.ID, &w.SeasonID, &w.WeekNumber, &w.Title, &w.Description,
		&w.StartsAt, &w.EndsAt, &w.IsActive, &w.IsClosed,
		&w.OfficialEvictionAnnounced, new(string), &w.TotalVotes,
	)
	if err != nil {
		return nil, err // may be sql.ErrNoRows, not necessarily an error
	}
	// Load nominees
	nominees, _ := GetNomineesByWeek(w.ID)
	w.Nominees = nominees
	return &w, nil
}

func GetAllWeeksBySeason(seasonID string) ([]models.NominationWeek, error) {
	ctx, cancel := Q()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		SELECT id, season_id, week_number, title, COALESCE(description,''),
		       starts_at, ends_at, is_active, is_closed,
		       official_eviction_announced, total_votes
		FROM nomination_weeks WHERE season_id=$1
		ORDER BY week_number DESC
	`, seasonID)
	if err != nil {
		return nil, fmt.Errorf("GetAllWeeksBySeason: %w", err)
	}
	defer rows.Close()

	var weeks []models.NominationWeek
	for rows.Next() {
		var w models.NominationWeek
		if err := rows.Scan(&w.ID, &w.SeasonID, &w.WeekNumber, &w.Title, &w.Description,
			&w.StartsAt, &w.EndsAt, &w.IsActive, &w.IsClosed,
			&w.OfficialEvictionAnnounced, &w.TotalVotes); err != nil {
			return nil, fmt.Errorf("GetAllWeeksBySeason scan: %w", err)
		}
		nominees, _ := GetNomineesByWeek(w.ID)
		w.Nominees = nominees
		weeks = append(weeks, w)
	}
	return weeks, rows.Err()
}

func GetWeekByID(weekID string) (*models.NominationWeek, error) {
	ctx, cancel := Q()
	defer cancel()

	var w models.NominationWeek
	err := DB.QueryRowContext(ctx, `
		SELECT id, season_id, week_number, title, COALESCE(description,''),
		       starts_at, ends_at, is_active, is_closed,
		       official_eviction_announced, COALESCE(official_evicted_contestant_id::text,''),
		       total_votes
		FROM nomination_weeks WHERE id=$1
	`, weekID).Scan(
		&w.ID, &w.SeasonID, &w.WeekNumber, &w.Title, &w.Description,
		&w.StartsAt, &w.EndsAt, &w.IsActive, &w.IsClosed,
		&w.OfficialEvictionAnnounced, new(string), &w.TotalVotes,
	)
	if err != nil {
		return nil, fmt.Errorf("GetWeekByID: %w", err)
	}
	nominees, _ := GetNomineesByWeek(w.ID)
	w.Nominees = nominees
	return &w, nil
}

func CreateWeek(req models.AdminCreatePollRequest) (*models.NominationWeek, error) {
	ctx, cancel := Q()
	defer cancel()

	// Deactivate previous active weeks for this season
	_, _ = DB.ExecContext(ctx, `
		UPDATE nomination_weeks SET is_active=FALSE, is_closed=TRUE, updated_at=NOW()
		WHERE season_id=$1 AND is_active=TRUE
	`, req.SeasonID)

	var w models.NominationWeek
	err := DB.QueryRowContext(ctx, `
		INSERT INTO nomination_weeks (season_id, week_number, title, description, starts_at, ends_at, is_active, is_closed)
		VALUES ($1,$2,$3,$4,$5,$6,TRUE,FALSE)
		RETURNING id, season_id, week_number, title, COALESCE(description,''),
		          starts_at, ends_at, is_active, is_closed, official_eviction_announced, total_votes
	`, req.SeasonID, req.WeekNumber, req.Title, req.Description, req.StartsAt, req.EndsAt,
	).Scan(&w.ID, &w.SeasonID, &w.WeekNumber, &w.Title, &w.Description,
		&w.StartsAt, &w.EndsAt, &w.IsActive, &w.IsClosed, &w.OfficialEvictionAnnounced, &w.TotalVotes)
	if err != nil {
		return nil, fmt.Errorf("CreateWeek: %w", err)
	}

	// Add nominees
	for _, nid := range req.NomineeIDs {
		_, _ = DB.ExecContext(ctx, `
			INSERT INTO weekly_nominations (week_id, contestant_id, vote_count)
			VALUES ($1,$2,0) ON CONFLICT DO NOTHING
		`, w.ID, nid)
		// Increment nominations_count
		_, _ = DB.ExecContext(ctx, `
			UPDATE contestants SET nominations_count=nominations_count+1 WHERE id=$1
		`, nid)
	}

	nominees, _ := GetNomineesByWeek(w.ID)
	w.Nominees = nominees
	return &w, nil
}

func CloseWeek(weekID string) error {
	return Exec(`
		UPDATE nomination_weeks SET is_active=FALSE, is_closed=TRUE, updated_at=NOW()
		WHERE id=$1
	`, weekID)
}

func EvictContestant(weekID, contestantID, reason string) (*models.NominationWeek, error) {
	ctx, cancel := Q()
	defer cancel()

	// Mark week closed with official result
	_, err := DB.ExecContext(ctx, `
		UPDATE nomination_weeks
		SET is_active=FALSE, is_closed=TRUE, official_eviction_announced=TRUE,
		    official_evicted_contestant_id=$1::uuid, updated_at=NOW()
		WHERE id=$2
	`, contestantID, weekID)
	if err != nil {
		return nil, fmt.Errorf("EvictContestant update week: %w", err)
	}

	// Mark nomination entry as evicted
	_, _ = DB.ExecContext(ctx, `
		UPDATE weekly_nominations SET is_evicted=TRUE, eviction_reason=$1
		WHERE week_id=$2 AND contestant_id=$3
	`, reason, weekID, contestantID)

	// Update contestant global status
	_, _ = DB.ExecContext(ctx, `
		UPDATE contestants SET status='evicted', updated_at=NOW() WHERE id=$1
	`, contestantID)

	return GetWeekByID(weekID)
}

// ============================================================
// NOMINEES
// ============================================================

func GetNomineesByWeek(weekID string) ([]models.Contestant, error) {
	ctx, cancel := Q()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		SELECT c.id, c.season_id, c.name, COALESCE(c.native_name,''), c.slug,
		       COALESCE(c.photo_url,''), COALESCE(c.bio,''), COALESCE(c.occupation,''),
		       c.status, c.entry_type,
		       wn.vote_count, wn.is_evicted, COALESCE(wn.eviction_reason,'')
		FROM weekly_nominations wn
		JOIN contestants c ON c.id = wn.contestant_id
		WHERE wn.week_id = $1
		ORDER BY wn.vote_count DESC
	`, weekID)
	if err != nil {
		return nil, fmt.Errorf("GetNomineesByWeek: %w", err)
	}
	defer rows.Close()

	var list []models.Contestant
	var totalVotes int64
	var nominees []struct {
		c     models.Contestant
		votes int64
	}

	for rows.Next() {
		var c models.Contestant
		var votes int64
		if err := rows.Scan(&c.ID, &c.SeasonID, &c.Name, &c.NativeName, &c.Slug,
			&c.PhotoURL, &c.Bio, &c.Occupation, &c.Status, &c.EntryType,
			&votes, &c.IsEvicted, &c.EvictionReason); err != nil {
			continue
		}
		c.VoteCount = votes
		totalVotes += votes
		nominees = append(nominees, struct {
			c     models.Contestant
			votes int64
		}{c, votes})
	}

	// Calculate percentages
	for _, n := range nominees {
		c := n.c
		if totalVotes > 0 {
			c.VoteShare = float64(n.votes) / float64(totalVotes) * 100.0
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

// ============================================================
// VOTES
// ============================================================

// CastVote inserts a vote; returns false if duplicate (already voted today)
func CastVote(weekID, contestantID, deviceID string) (bool, error) {
	ctx, cancel := Q()
	defer cancel()

	tx, err := DB.BeginTx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("CastVote begin tx: %w", err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO votes (week_id, contestant_id, device_id, voted_date)
		VALUES ($1::uuid, $2::uuid, $3, CURRENT_DATE)
	`, weekID, contestantID, deviceID)
	if err != nil {
		tx.Rollback()
		// Unique constraint violation = already voted
		return false, nil
	}

	// Increment vote_count on weekly_nominations
	_, err = tx.ExecContext(ctx, `
		UPDATE weekly_nominations SET vote_count = vote_count + 1
		WHERE week_id=$1 AND contestant_id=$2
	`, weekID, contestantID)
	if err != nil {
		tx.Rollback()
		return false, fmt.Errorf("CastVote increment: %w", err)
	}

	// Increment total_votes on nomination_weeks
	_, err = tx.ExecContext(ctx, `
		UPDATE nomination_weeks SET total_votes = total_votes + 1 WHERE id=$1
	`, weekID)
	if err != nil {
		tx.Rollback()
		return false, fmt.Errorf("CastVote total: %w", err)
	}

	return true, tx.Commit()
}

// HasVotedToday checks if device has already voted for this week today
func HasVotedToday(weekID, deviceID string) (bool, string, error) {
	ctx, cancel := Q()
	defer cancel()

	var contestantID string
	err := DB.QueryRowContext(ctx, `
		SELECT contestant_id FROM votes
		WHERE week_id=$1 AND device_id=$2 AND voted_date=CURRENT_DATE
	`, weekID, deviceID).Scan(&contestantID)
	if err != nil {
		return false, "", nil // no row = not voted
	}
	return true, contestantID, nil
}

// GetWeekTotalVotes returns current total votes for a week
func GetWeekTotalVotes(weekID string) (int64, error) {
	ctx, cancel := Q()
	defer cancel()
	var total int64
	err := DB.QueryRowContext(ctx, `SELECT total_votes FROM nomination_weeks WHERE id=$1`, weekID).Scan(&total)
	return total, err
}

// ============================================================
// DEVICE ACCOUNTS
// ============================================================

func UpsertDeviceAccount(d models.DeviceAccount) (*models.DeviceAccount, error) {
	ctx, cancel := Q()
	defer cancel()

	var out models.DeviceAccount
	err := DB.QueryRowContext(ctx, `
		INSERT INTO device_accounts (device_id, nickname, avatar_color, last_active_at)
		VALUES ($1,$2,$3,NOW())
		ON CONFLICT (device_id) DO UPDATE SET nickname=EXCLUDED.nickname,
		    avatar_color=EXCLUDED.avatar_color, last_active_at=NOW()
		RETURNING id, device_id, nickname, avatar_color, COALESCE(email,''), is_verified, created_at
	`, d.DeviceID, d.Nickname, d.AvatarColor,
	).Scan(&out.ID, &out.DeviceID, &out.Nickname, &out.AvatarColor, &out.Email, &out.IsVerified, &out.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("UpsertDeviceAccount: %w", err)
	}
	return &out, nil
}

// ============================================================
// CHAT MESSAGES
// ============================================================

func GetChatMessages(weekID string, limit int) ([]models.ChatMessage, error) {
	ctx, cancel := Q()
	defer cancel()

	if limit <= 0 {
		limit = 100
	}

	rows, err := DB.QueryContext(ctx, `
		SELECT id, week_id, device_id, nickname, avatar_color, content, is_pinned, created_at
		FROM chat_messages
		WHERE week_id=$1
		ORDER BY created_at ASC
		LIMIT $2
	`, weekID, limit)
	if err != nil {
		return nil, fmt.Errorf("GetChatMessages: %w", err)
	}
	defer rows.Close()

	var msgs []models.ChatMessage
	for rows.Next() {
		var m models.ChatMessage
		if err := rows.Scan(&m.ID, &m.WeekID, &m.DeviceID, &m.Nickname,
			&m.AvatarColor, &m.Content, &m.IsPinned, &m.CreatedAt); err != nil {
			continue
		}
		msgs = append(msgs, m)
	}
	return msgs, rows.Err()
}

func SaveChatMessage(req models.ChatRequest) (*models.ChatMessage, error) {
	ctx, cancel := Q()
	defer cancel()

	if len(req.Content) > 500 {
		req.Content = req.Content[:500]
	}

	var m models.ChatMessage
	err := DB.QueryRowContext(ctx, `
		INSERT INTO chat_messages (week_id, device_id, nickname, avatar_color, content)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id, week_id, device_id, nickname, avatar_color, content, is_pinned, created_at
	`, req.WeekID, req.DeviceID, req.Nickname, req.AvatarColor, req.Content,
	).Scan(&m.ID, &m.WeekID, &m.DeviceID, &m.Nickname, &m.AvatarColor, &m.Content, &m.IsPinned, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("SaveChatMessage: %w", err)
	}
	return &m, nil
}

func PinChatMessage(messageID string) error {
	return Exec(`UPDATE chat_messages SET is_pinned=TRUE WHERE id=$1`, messageID)
}

func DeleteChatMessage(messageID string) error {
	return Exec(`DELETE FROM chat_messages WHERE id=$1`, messageID)
}

// ============================================================
// ADMIN - All Weeks across all seasons
// ============================================================

func GetAllWeeks() ([]models.NominationWeek, error) {
	ctx, cancel := Q()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		SELECT nw.id, nw.season_id, se.show_id, nw.week_number, nw.title,
		       COALESCE(nw.description,''), nw.starts_at, nw.ends_at,
		       nw.is_active, nw.is_closed, nw.official_eviction_announced, nw.total_votes
		FROM nomination_weeks nw
		JOIN seasons se ON se.id = nw.season_id
		ORDER BY nw.starts_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("GetAllWeeks: %w", err)
	}
	defer rows.Close()

	var weeks []models.NominationWeek
	for rows.Next() {
		var w models.NominationWeek
		var showID string
		if err := rows.Scan(&w.ID, &w.SeasonID, &showID, &w.WeekNumber, &w.Title,
			&w.Description, &w.StartsAt, &w.EndsAt, &w.IsActive, &w.IsClosed,
			&w.OfficialEvictionAnnounced, &w.TotalVotes); err != nil {
			continue
		}
		nominees, _ := GetNomineesByWeek(w.ID)
		w.Nominees = nominees
		weeks = append(weeks, w)
	}
	return weeks, rows.Err()
}

// ============================================================
// HELPER
// ============================================================

func slugify(s string) string {
	result := make([]byte, 0, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			result = append(result, c+32)
		} else if (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') {
			result = append(result, c)
		} else if c == ' ' || c == '-' || c == '_' {
			result = append(result, '-')
		}
	}
	// deduplicate dashes
	clean := make([]byte, 0, len(result))
	prev := byte(0)
	for _, c := range result {
		if c == '-' && prev == '-' {
			continue
		}
		clean = append(clean, c)
		prev = c
	}
	// trim leading/trailing dash
	if len(clean) > 0 && clean[0] == '-' {
		clean = clean[1:]
	}
	if len(clean) > 0 && clean[len(clean)-1] == '-' {
		clean = clean[:len(clean)-1]
	}
	if len(clean) == 0 {
		return fmt.Sprintf("contestant-%d", time.Now().UnixNano())
	}
	return string(clean)
}
