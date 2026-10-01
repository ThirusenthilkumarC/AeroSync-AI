# AeroSync AI – OR-Tools Disruption Optimization Constraints

class DisruptionConstraints:
    @staticmethod
    def check_crew_duty_limit(current_duty_mins: int, required_mins: int, max_duty_mins: int = 720) -> bool:
        """Enforces DGCA FDTL Rule 12 maximum duty hour threshold."""
        return (current_duty_mins + required_mins) <= max_duty_mins

    @staticmethod
    def check_turnaround_feasibility(available_slot_mins: int, min_turnaround_mins: int = 18) -> bool:
        """Verifies minimum aircraft turnaround window at hub."""
        return available_slot_mins >= min_turnaround_mins

    @staticmethod
    def check_gate_stand_conflict(target_gate_occupied: bool) -> bool:
        """Checks target terminal stand occupancy status."""
        return not target_gate_occupied
