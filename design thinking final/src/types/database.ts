export interface Room {
  id: string;
  room_code: string;
  display_name: string;
  room_type: string;
  floor_number: number;
  seating_capacity: number | null;
  has_ac: boolean;
  has_charging_points: boolean;
  is_student_accessible: boolean;
  source_room_name?: string;
  source_room_type?: string;
  source_marked_free_in_room_list?: string;
  data_quality_status?: string;
  created_at?: string;
}

export interface RoomScheduleSlot {
  id: string;
  room_id: string;
  day_of_week: number; // 1 = Mon ... 6 = Sat
  day_label: string;
  period_number: number; // 1 .. 7
  start_time: string;
  end_time: string;
  slot_type: 'free' | 'class' | 'lab' | 'lab-continue';
  is_scheduled_free: boolean;
  scheduled_label?: string;
  span_periods?: number;
  source_time_label?: string;
  source_version?: string;
  source_slot_type?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description?: string;
  category: 'academic' | 'club' | 'seminar' | 'cultural' | 'administrative' | 'holiday';
  start_datetime: string;
  end_datetime: string;
  venue_text: string;
  room_id?: string;
  poster_url?: string;
  registration_url?: string;
  organizer_club?: string;
  organizer_department?: string;
  is_holiday: boolean;
  open_to?: string;
  created_at?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  cabin_location: string;
  subjects: string[];
  photo_url?: string;
  email?: string;
  phone?: string;
}

export interface CampusIssue {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  location_text: string;
  room_id?: string;
  status: 'registered' | 'in_progress' | 'resolved';
  reported_by: string;
  assigned_to?: string;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}
