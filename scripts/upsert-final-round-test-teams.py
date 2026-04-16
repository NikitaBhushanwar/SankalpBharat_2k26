import hashlib
import os
import random
import secrets
import ssl
import urllib.parse
import urllib.request
from pathlib import Path


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or '=' not in stripped:
            continue
        key, value = stripped.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    derived = hashlib.scrypt(
        password.encode('utf-8'),
        salt=salt.encode('utf-8'),
        n=16384,
        r=8,
        p=1,
        dklen=64,
    )
    return f'{salt}:{derived.hex()}'


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    load_env(root / '.env.local')
    load_env(root / '.env')

    supabase_url = os.environ['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
    service_key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    tls_context = ssl.create_default_context()
    tls_context.check_hostname = False
    tls_context.verify_mode = ssl.CERT_NONE

    for team_id in ['SKB-F33', 'SKB-F34', 'SKB-F35', 'SKB-F36', 'SKB-F37', 'SKB-F38']:
        payload = {
            'team_id': team_id,
            'team_name': team_id,
            'password_hash': hash_password(f'test-{team_id}-{random.randint(100000, 999999)}'),
        }
        query = urllib.parse.urlencode({'on_conflict': 'team_id'})
        request = urllib.request.Request(
            f'{supabase_url}/rest/v1/final_round_teams?{query}',
            data=bytes(__import__('json').dumps(payload), 'utf-8'),
            method='POST',
            headers={
                'apikey': service_key,
                'Authorization': f'Bearer {service_key}',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation',
            },
        )
        with urllib.request.urlopen(request, context=tls_context) as response:
            print(team_id, response.status)


if __name__ == '__main__':
    main()
