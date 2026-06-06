export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  env: "test" | "live";
  createdAt: string;
  lastUsed: string;
};

export type EmailLog = {
  id: string;
  to: string;
  from: string;
  subject: string;
  status: "delivered" | "queued" | "bounced" | "failed" | "opened";
  sentAt: string;
  opens: number;
  clicks: number;
};

export type Domain = {
  id: string;
  name: string;
  status: "verified" | "pending" | "failed";
  region: string;
  addedAt: string;
};

export const apiKeys: ApiKey[] = [
  { id: "k_1", name: "Production server", prefix: "nm_live_8fH2", env: "live", createdAt: "2026-04-12", lastUsed: "3 minutes ago" },
  { id: "k_2", name: "Marketing worker", prefix: "nm_live_q9Vc", env: "live", createdAt: "2026-03-02", lastUsed: "2 hours ago" },
  { id: "k_3", name: "Local dev — ada", prefix: "nm_test_w1Pe", env: "test", createdAt: "2026-05-21", lastUsed: "yesterday" },
  { id: "k_4", name: "CI pipeline", prefix: "nm_test_r4Mz", env: "test", createdAt: "2026-01-18", lastUsed: "4 days ago" },
];

export const emailLogs: EmailLog[] = [
  { id: "e_001", to: "ada@lovelace.dev", from: "noreply@novamail.app", subject: "Welcome to Acme", status: "opened", sentAt: "2026-06-06 09:42", opens: 3, clicks: 1 },
  { id: "e_002", to: "linus@kernel.org", from: "noreply@novamail.app", subject: "Reset your password", status: "delivered", sentAt: "2026-06-06 09:31", opens: 0, clicks: 0 },
  { id: "e_003", to: "grace@hopper.io", from: "billing@novamail.app", subject: "Invoice #4821", status: "delivered", sentAt: "2026-06-06 09:14", opens: 1, clicks: 0 },
  { id: "e_004", to: "alan@turing.dev", from: "noreply@novamail.app", subject: "Your weekly digest", status: "queued", sentAt: "2026-06-06 09:02", opens: 0, clicks: 0 },
  { id: "e_005", to: "bounce@example.com", from: "noreply@novamail.app", subject: "Order confirmation", status: "bounced", sentAt: "2026-06-06 08:51", opens: 0, clicks: 0 },
  { id: "e_006", to: "marie@curie.dev", from: "noreply@novamail.app", subject: "Magic sign-in link", status: "opened", sentAt: "2026-06-06 08:33", opens: 2, clicks: 1 },
  { id: "e_007", to: "ken@thompson.dev", from: "noreply@novamail.app", subject: "Two-factor code", status: "delivered", sentAt: "2026-06-06 08:12", opens: 0, clicks: 0 },
  { id: "e_008", to: "denied@blocked.io", from: "noreply@novamail.app", subject: "Promo: 20% off", status: "failed", sentAt: "2026-06-06 07:58", opens: 0, clicks: 0 },
];

export const domains: Domain[] = [
  { id: "d_1", name: "novamail.app", status: "verified", region: "us-east", addedAt: "2026-02-10" },
  { id: "d_2", name: "mail.acme.dev", status: "verified", region: "eu-west", addedAt: "2026-03-22" },
  { id: "d_3", name: "send.staging.io", status: "pending", region: "us-east", addedAt: "2026-06-04" },
];

export const trendData = Array.from({ length: 30 }).map((_, i) => {
  const base = 1200 + Math.round(Math.sin(i / 3) * 280 + i * 22);
  return {
    day: `D${i + 1}`,
    sent: base + Math.round(Math.random() * 120),
    delivered: base - Math.round(Math.random() * 90),
    bounced: Math.round(20 + Math.random() * 18),
  };
});

export const spark = (seed = 1) =>
  Array.from({ length: 20 }).map((_, i) => ({
    x: i,
    y: Math.round(40 + Math.sin((i + seed) / 2) * 18 + Math.random() * 10),
  }));

export const getCodeSnippets = (apiUrl: string) => ({
  curl: `curl ${apiUrl} \\
  -H "Authorization: Bearer nm_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@sitenova.dev",
    "to": "ada@lovelace.dev",
    "subject": "Hello from NovaMail",
    "html": "<strong>It works!</strong>"
  }'`,
  node: `import fetch from 'node-fetch';

const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nm_live_••••••••',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'hello@sitenova.dev',
    to: 'ada@lovelace.dev',
    subject: 'Hello from NovaMail',
    html: '<strong>It works!</strong>'
  })
});`,
  python: `import requests

url = "${apiUrl}"
headers = {
    "Authorization": "Bearer nm_live_••••••••",
    "Content-Type": "application/json"
}
data = {
    "from": "hello@sitenova.dev",
    "to": "ada@lovelace.dev",
    "subject": "Hello from NovaMail",
    "html": "<strong>It works!</strong>"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
  php: `<?php
$ch = curl_init('${apiUrl}');
$data = json_encode([
    'from' => 'hello@sitenova.dev',
    'to' => 'ada@lovelace.dev',
    'subject' => 'Hello from NovaMail',
    'html' => '<strong>It works!</strong>'
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer nm_live_••••••••',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,
  go: `package main

import (
	"bytes"
	"fmt"
	"net/http"
)

func main() {
	url := "${apiUrl}"
	var jsonData = []byte(\`{
		"from": "hello@sitenova.dev",
		"to": "ada@lovelace.dev",
		"subject": "Hello from NovaMail",
		"html": "<strong>It works!</strong>"
	}\`)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer nm_live_••••••••")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()

	fmt.Println(resp.Status)
}`,
  ruby: `require 'uri'
require 'net/http'
require 'json'

uri = URI('${apiUrl}')
req = Net::HTTP::Post.new(uri)
req['Authorization'] = 'Bearer nm_live_••••••••'
req['Content-Type'] = 'application/json'

req.body = {
  from: 'hello@sitenova.dev',
  to: 'ada@lovelace.dev',
  subject: 'Hello from NovaMail',
  html: '<strong>It works!</strong>'
}.to_json

res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(req)
end

puts res.body`
});