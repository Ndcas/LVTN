import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/doctor_service.dart';

class ExaminationScreen extends StatefulWidget {
  final int bookingId;

  const ExaminationScreen({super.key, required this.bookingId});

  @override
  State<ExaminationScreen> createState() => _ExaminationScreenState();
}

class _ExaminationScreenState extends State<ExaminationScreen> {
  final DoctorService _doctorService = DoctorService();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = true;
  bool _isSubmitting = false;

  // Data from backend
  List<Map<String, dynamic>> _allDiseases = [];
  List<Map<String, dynamic>> _allMedicines = [];

  // Form State
  String _symptoms = '';
  String _diagnosis = '';
  List<dynamic> _selectedDiseases = [];
  final List<Map<String, dynamic>> _prescriptions = [];

  @override
  void initState() {
    super.initState();

    _fetchCatalogs();
  }

  Future<void> _fetchCatalogs() async {
    try {
      final results = await Future.wait([
        _doctorService.getAllDiseases(),
        _doctorService.getAllMedicines(),
      ]);

      if (mounted) {
        setState(() {
          _allDiseases = List<Map<String, dynamic>>.from(results[0]);
          _allMedicines = List<Map<String, dynamic>>.from(results[1]);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải dữ liệu bệnh/thuốc: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    _formKey.currentState!.save();

    setState(() => _isSubmitting = true);

    try {
      final diseaseId = _selectedDiseases.isNotEmpty
          ? _selectedDiseases.first['id']
          : null;

      // Clean up prescriptions data before sending
      final cleanedPrescriptions = _prescriptions
          .where((p) => p['medicine'] != null)
          .map((p) {
            return {
              'medicineId': p['medicine']['id'],
              'quantity': int.tryParse(p['quantity'].toString()) ?? 0,
              'dosage': p['dosage'] ?? '',
              'note': p['note'] ?? '',
            };
          })
          .toList();

      final data = {
        'clinicalIndicators': _symptoms,
        'diagnoseDetail': _diagnosis,
        if (diseaseId != null) 'diseaseId': diseaseId,
        'prescriptionDetails': cleanedPrescriptions,
      };

      await _doctorService.finishBooking(widget.bookingId, data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Hoàn thành khám bệnh thành công')),
        );

        context.pop(); // Go back to detail screen
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  void _addPrescriptionRow() {
    setState(() {
      _prescriptions.add({
        'medicine': null,
        'quantity': '',
        'dosage': '',
        'note': '',
      });
    });
  }

  void _removePrescriptionRow(int index) {
    setState(() {
      _prescriptions.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Khám bệnh')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  const Text(
                    'Thông tin lâm sàng',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Triệu chứng (*)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                    validator: (value) =>
                        value == null || value.isEmpty ? 'Bắt buộc nhập' : null,
                    onSaved: (value) => _symptoms = value ?? '',
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Chẩn đoán (*)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                    validator: (value) =>
                        value == null || value.isEmpty ? 'Bắt buộc nhập' : null,
                    onSaved: (value) => _diagnosis = value ?? '',
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Bệnh lý (ICD-10)',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: _selectedDiseases.map((d) {
                      return Chip(
                        label: Text('${d['diseaseCode']} - ${d['name']}'),
                        onDeleted: () {
                          setState(() {
                            _selectedDiseases.remove(d);
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 8),
                  Autocomplete<Map<String, dynamic>>(
                    optionsBuilder: (TextEditingValue textEditingValue) {
                      if (textEditingValue.text.isEmpty) {
                        return const Iterable<Map<String, dynamic>>.empty();
                      }
                      return _allDiseases.where((Map<String, dynamic> disease) {
                        return disease['name']
                                .toString()
                                .toLowerCase()
                                .contains(
                                  textEditingValue.text.toLowerCase(),
                                ) ||
                            disease['diseaseCode']
                                .toString()
                                .toLowerCase()
                                .contains(textEditingValue.text.toLowerCase());
                      });
                    },
                    displayStringForOption: (Map<String, dynamic> option) =>
                        '${option['diseaseCode']} - ${option['name']}',
                    onSelected: (Map<String, dynamic> selection) {
                      setState(() {
                        _selectedDiseases = [selection];
                      });
                    },
                    fieldViewBuilder:
                        (context, controller, focusNode, onFieldSubmitted) {
                          return TextFormField(
                            controller: controller,
                            focusNode: focusNode,
                            decoration: const InputDecoration(
                              labelText: 'Tìm bệnh lý...',
                              border: OutlineInputBorder(),
                              suffixIcon: Icon(Icons.search),
                            ),
                          );
                        },
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Đơn thuốc',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: _addPrescriptionRow,
                        icon: const Icon(Icons.add),
                        label: const Text('Thêm thuốc'),
                      ),
                    ],
                  ),
                  const Divider(),
                  ..._prescriptions.asMap().entries.map((entry) {
                    int index = entry.key;
                    var p = entry.value;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Autocomplete<Map<String, dynamic>>(
                                    initialValue: TextEditingValue(
                                      text: p['medicine']?['name'] ?? '',
                                    ),
                                    optionsBuilder:
                                        (TextEditingValue textEditingValue) {
                                          if (textEditingValue.text.isEmpty) {
                                            return const Iterable<
                                              Map<String, dynamic>
                                            >.empty();
                                          }
                                          return _allMedicines.where((
                                            Map<String, dynamic> medicine,
                                          ) {
                                            return medicine['name']
                                                .toString()
                                                .toLowerCase()
                                                .contains(
                                                  textEditingValue.text
                                                      .toLowerCase(),
                                                );
                                          });
                                        },
                                    displayStringForOption:
                                        (Map<String, dynamic> option) =>
                                            '${option['name']} (${option['unit']})',
                                    onSelected:
                                        (Map<String, dynamic> selection) {
                                          setState(() {
                                            _prescriptions[index]['medicine'] =
                                                selection;
                                          });
                                        },
                                    fieldViewBuilder:
                                        (
                                          context,
                                          controller,
                                          focusNode,
                                          onFieldSubmitted,
                                        ) {
                                          return TextFormField(
                                            controller: controller,
                                            focusNode: focusNode,
                                            decoration: const InputDecoration(
                                              labelText: 'Chọn thuốc',
                                            ),
                                          );
                                        },
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.delete,
                                    color: Colors.red,
                                  ),
                                  onPressed: () =>
                                      _removePrescriptionRow(index),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  flex: 1,
                                  child: TextFormField(
                                    initialValue: p['quantity'],
                                    decoration: const InputDecoration(
                                      labelText: 'SL',
                                    ),
                                    keyboardType: TextInputType.number,
                                    onChanged: (val) =>
                                        _prescriptions[index]['quantity'] = val,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  flex: 3,
                                  child: TextFormField(
                                    initialValue: p['dosage'],
                                    decoration: const InputDecoration(
                                      labelText: 'Liều dùng (VD: 2 viên/ngày)',
                                    ),
                                    onChanged: (val) =>
                                        _prescriptions[index]['dosage'] = val,
                                  ),
                                ),
                              ],
                            ),
                            TextFormField(
                              initialValue: p['note'],
                              decoration: const InputDecoration(
                                labelText: 'Ghi chú (Tùy chọn)',
                              ),
                              onChanged: (val) =>
                                  _prescriptions[index]['note'] = val,
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                    child: _isSubmitting
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Hoàn tất khám bệnh',
                            style: TextStyle(fontSize: 16),
                          ),
                  ),
                ],
              ),
            ),
    );
  }
}
