import 'package:flutter/material.dart';
import '../../services/api_logger.dart';

class AdminLogScreen extends StatelessWidget {
  const AdminLogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin API Logs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () {
              ApiLogger().clearLogs();
            },
          )
        ],
      ),
      body: ListenableBuilder(
        listenable: ApiLogger(),
        builder: (context, _) {
          final logs = ApiLogger().logs;
          if (logs.isEmpty) {
            return const Center(child: Text('Chưa có log nào.'));
          }
          return ListView.builder(
            itemCount: logs.length,
            itemBuilder: (context, index) {
              final log = logs[index];
              final isError = log.error != null || (log.statusCode != null && log.statusCode! >= 400);
              
              return ExpansionTile(
                title: Text(
                  '[${log.method}] ${log.url}',
                  style: TextStyle(color: isError ? Colors.red : Colors.green),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  '${log.timestamp.toString().substring(11, 19)} - Status: ${log.statusCode ?? "ERROR"}',
                ),
                children: [
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    alignment: Alignment.centerLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (log.requestBody != null) ...[
                          const Text('Request Body:', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(log.requestBody!),
                          const SizedBox(height: 8),
                        ],
                        if (log.responseBody != null) ...[
                          const Text('Response Body:', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(log.responseBody!),
                          const SizedBox(height: 8),
                        ],
                        if (log.error != null) ...[
                          const Text('Error:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                          Text(log.error!, style: const TextStyle(color: Colors.red)),
                        ],
                      ],
                    ),
                  )
                ],
              );
            },
          );
        },
      ),
    );
  }
}
