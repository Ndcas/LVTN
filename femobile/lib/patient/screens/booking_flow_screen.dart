import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/patient_service.dart';
import 'package:intl/intl.dart';

class BookingFlowScreen extends StatefulWidget {
  const BookingFlowScreen({super.key});

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  final PatientService _patientService = PatientService();
  int _currentStep = 0;

  // Data
  List<dynamic> _specialties = [];
  bool _isLoadingSpecialties = true;
  List<dynamic> _availableSlots = [];
  bool _isLoadingSlots = false;
  bool _isBooking = false;

  // Selections
  int? _selectedSpecialtyId;
  String? _selectedClinicType;
  DateTime? _selectedDate;
  int? _selectedSlotId;

  @override
  void initState() {
    super.initState();

    _fetchSpecialties();
  }

  Future<void> _fetchSpecialties() async {
    try {
      final data = await _patientService.getSpecialties();

      if (mounted) {
        setState(() {
          _specialties = data;
          _isLoadingSpecialties = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingSpecialties = false);

        _showError(
          'Lỗi tải chuyên khoa: ${e is DioException ? parseDioError(e) : e.toString()}',
        );
      }
    }
  }

  Future<void> _fetchSlots() async {
    if (_selectedSpecialtyId == null ||
        _selectedClinicType == null ||
        _selectedDate == null) {
      return;
    }

    setState(() {
      _isLoadingSlots = true;
      _selectedSlotId = null; // reset slot selection
    });

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final data = await _patientService.getAvailableTimeSlots(
        date: dateStr,
        specialtyId: _selectedSpecialtyId!,
        clinicType: _selectedClinicType!,
      );

      if (mounted) {
        setState(() {
          _availableSlots = data;
          _isLoadingSlots = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingSlots = false);

        _showError(
          'Lỗi tải ca khám: ${e is DioException ? parseDioError(e) : e.toString()}',
        );
      }
    }
  }

  Future<void> _confirmBooking() async {
    if (_selectedSlotId == null) {
      return;
    }

    setState(() => _isBooking = true);

    try {
      await _patientService.createBooking(_selectedSlotId!);

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Đặt lịch thành công!')));
        // Go back to home
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isBooking = false);

        _showError(
          'Lỗi đặt lịch: ${e is DioException ? parseDioError(e) : e.toString()}',
        );
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  void _nextStep() {
    if (_currentStep == 0 && _selectedSpecialtyId == null) {
      _showError('Vui lòng chọn chuyên khoa');

      return;
    }

    if (_currentStep == 1 && _selectedClinicType == null) {
      _showError('Vui lòng chọn hình thức khám');

      return;
    }

    if (_currentStep == 2 && _selectedDate == null) {
      _showError('Vui lòng chọn ngày khám');

      return;
    }

    if (_currentStep == 3 && _selectedSlotId == null) {
      _showError('Vui lòng chọn ca khám');

      return;
    }

    if (_currentStep == 2) {
      // Just moved from Date to Slots, fetch slots
      _fetchSlots();
    }

    if (_currentStep < 4) {
      setState(() => _currentStep++);
    } else {
      _confirmBooking();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đặt lịch hẹn')),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: _nextStep,
        onStepCancel: _prevStep,
        controlsBuilder: (context, details) {
          final isLastStep = _currentStep == 4;
          return Padding(
            padding: const EdgeInsets.only(top: 16.0),
            child: Row(
              children: [
                if (!isLastStep)
                  ElevatedButton(
                    onPressed: details.onStepContinue,
                    child: const Text('Tiếp tục'),
                  ),
                if (isLastStep)
                  ElevatedButton(
                    onPressed: _isBooking ? null : details.onStepContinue,
                    child: _isBooking
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Xác nhận đặt lịch'),
                  ),
                if (_currentStep > 0 && !isLastStep) ...[
                  const SizedBox(width: 12),
                  TextButton(
                    onPressed: details.onStepCancel,
                    child: const Text('Quay lại'),
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('1. Chọn chuyên khoa'),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            content: _buildSpecialtyStep(),
          ),
          Step(
            title: const Text('2. Hình thức khám'),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            content: _buildClinicTypeStep(),
          ),
          Step(
            title: const Text('3. Chọn ngày khám'),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            content: _buildDateStep(),
          ),
          Step(
            title: const Text('4. Chọn ca khám'),
            isActive: _currentStep >= 3,
            state: _currentStep > 3 ? StepState.complete : StepState.indexed,
            content: _buildSlotStep(),
          ),
          Step(
            title: const Text('5. Xác nhận'),
            isActive: _currentStep >= 4,
            content: _buildConfirmStep(),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecialtyStep() {
    if (_isLoadingSpecialties) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_specialties.isEmpty) {
      return const Text('Không có chuyên khoa nào');
    }

    return Wrap(
      spacing: 8.0,
      runSpacing: 8.0,
      children: _specialties.map((item) {
        final isSelected = _selectedSpecialtyId == item['id'];
        return ChoiceChip(
          label: Text(item['name'] ?? ''),
          selected: isSelected,
          onSelected: (selected) {
            setState(() => _selectedSpecialtyId = selected ? item['id'] : null);
          },
        );
      }).toList(),
    );
  }

  Widget _buildClinicTypeStep() {
    return Column(
      children: [
        RadioListTile<String>(
          title: const Text('Khám trực tiếp tại phòng khám (OFFLINE)'),
          value: 'OFFLINE',
          groupValue: _selectedClinicType,
          onChanged: (value) => setState(() => _selectedClinicType = value),
        ),
        RadioListTile<String>(
          title: const Text('Khám qua video (ONLINE)'),
          value: 'ONLINE',
          groupValue: _selectedClinicType,
          onChanged: (value) => setState(() => _selectedClinicType = value),
        ),
      ],
    );
  }

  Widget _buildDateStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ElevatedButton.icon(
          icon: const Icon(Icons.calendar_month),
          label: Text(
            _selectedDate == null
                ? 'Chọn ngày khám'
                : DateFormat('dd/MM/yyyy').format(_selectedDate!),
          ),
          onPressed: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate:
                  _selectedDate ?? DateTime.now().add(const Duration(days: 1)),
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 30)),
            );
            if (picked != null) {
              setState(() => _selectedDate = picked);
            }
          },
        ),
      ],
    );
  }

  Widget _buildSlotStep() {
    if (_isLoadingSlots) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_availableSlots.isEmpty) {
      return const Text('Không có ca khám nào trống trong ngày này');
    }

    final Map<String, List<dynamic>> groupedSlots = {};
    for (var slot in _availableSlots) {
      final doctorName = slot['doctorName'] ?? 'Bác sĩ';
      if (!groupedSlots.containsKey(doctorName)) {
        groupedSlots[doctorName] = [];
      }
      groupedSlots[doctorName]!.add(slot);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: groupedSlots.entries.map((entry) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                entry.key,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            Wrap(
              spacing: 8.0,
              runSpacing: 8.0,
              children: entry.value.map((item) {
                final startTimeStr = item['startTime'] as String?;
                final endTimeStr = item['endTime'] as String?;
                final timeString =
                    (startTimeStr != null &&
                        endTimeStr != null &&
                        startTimeStr.length >= 5 &&
                        endTimeStr.length >= 5)
                    ? '${startTimeStr.substring(0, 5)} - ${endTimeStr.substring(0, 5)}'
                    : 'Unknown';
                final isSelected = _selectedSlotId == item['id'];

                return ChoiceChip(
                  label: Text(timeString),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(
                      () => _selectedSlotId = selected ? item['id'] : null,
                    );
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildConfirmStep() {
    if (_selectedSlotId == null) {
      return const SizedBox.shrink();
    }

    final slot = _availableSlots.firstWhere(
      (s) => s['id'] == _selectedSlotId,
      orElse: () => null,
    );

    if (slot == null) {
      return const SizedBox.shrink();
    }

    final specialtyName =
        _specialties.firstWhere(
          (s) => s['id'] == _selectedSpecialtyId,
          orElse: () => {'name': ''},
        )['name'] ??
        '';
    final doctorName = slot['doctorName'] ?? 'Bác sĩ';
    final startTimeStr = slot['startTime'] as String?;
    final timeFormatted = (startTimeStr != null && startTimeStr.length >= 5)
        ? startTimeStr.substring(0, 5)
        : '';
    final dateFormatted = _selectedDate != null
        ? DateFormat('dd/MM/yyyy').format(_selectedDate!)
        : '';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Chuyên khoa: $specialtyName'),
            const SizedBox(height: 8),
            Text('Bác sĩ: $doctorName'),
            const SizedBox(height: 8),
            Text(
              'Hình thức: ${_selectedClinicType == 'ONLINE' ? 'Khám qua Video (Online)' : 'Khám trực tiếp (Offline)'}',
            ),
            const SizedBox(height: 8),
            Text('Thời gian: $timeFormatted - $dateFormatted'),
          ],
        ),
      ),
    );
  }
}
