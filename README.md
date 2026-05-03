# IoT Monitoring Dashboard (Next.js + MQTT)

## Install

```bash
npm install
```

## Setup environment

Copy file contoh env:

```bash
copy .env.local.example .env.local
```

Tambahkan juga Supabase env jika belum ada:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hiyhczzetcczcyzhhzgs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## SQL schema (Supabase)

Jalankan di SQL Editor Supabase:

```sql
create table if not exists public.sensor_data (
  id bigint generated always as identity primary key,
  suhu double precision not null,
  kelembaban double precision not null,
  ldr text not null,
  created_at timestamptz not null default now()
);
```

## Run development

```bash
npm run dev
```

Buka: http://localhost:3000

## Build production

```bash
npm run build
npm run start
```

## MQTT topics

Subscribe:
- iot/suhu
- iot/kelembaban
- iot/ldr
- iot/relay1
- iot/relay2
- iot/relay3
- iot/relay4

Publish:
- iot/relay1/set
- iot/relay2/set
- iot/relay3/set
- iot/relay4/set
- iot/allrelay/set

Payload control: `ON` / `OFF`
