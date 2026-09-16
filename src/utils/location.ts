export interface UserLocation {
  cep: string;
  city: string;
  state: string;
  stateCode: string;
  neighborhood?: string;
  source: 'gps' | 'ip' | 'storage' | 'manual' | 'default';
}

const STORAGE_KEY = 'ml_user_location_v1';

// Mapeamento de capitais brasileiras para CEPs representativos
const STATE_DEFAULT_CEPS: Record<string, { cep: string; city: string; state: string; stateCode: string }> = {
  AC: { cep: '69900-060', city: 'Rio Branco', state: 'Acre', stateCode: 'AC' },
  AL: { cep: '57020-050', city: 'Maceió', state: 'Alagoas', stateCode: 'AL' },
  AP: { cep: '68900-073', city: 'Macapá', state: 'Amapá', stateCode: 'AP' },
  AM: { cep: '69005-040', city: 'Manaus', state: 'Amazonas', stateCode: 'AM' },
  BA: { cep: '40020-000', city: 'Salvador', state: 'Bahia', stateCode: 'BA' },
  CE: { cep: '60025-001', city: 'Fortaleza', state: 'Ceará', stateCode: 'CE' },
  DF: { cep: '70040-010', city: 'Brasília', state: 'Distrito Federal', stateCode: 'DF' },
  ES: { cep: '29010-004', city: 'Vitória', state: 'Espírito Santo', stateCode: 'ES' },
  GO: { cep: '74003-010', city: 'Goiânia', state: 'Goiás', stateCode: 'GO' },
  MA: { cep: '65010-020', city: 'São Luís', state: 'Maranhão', stateCode: 'MA' },
  MT: { cep: '78005-100', city: 'Cuiabá', state: 'Mato Grosso', stateCode: 'MT' },
  MS: { cep: '79002-001', city: 'Campo Grande', state: 'Mato Grosso do Sul', stateCode: 'MS' },
  MG: { cep: '30130-010', city: 'Belo Horizonte', state: 'Minas Gerais', stateCode: 'MG' },
  PA: { cep: '66010-000', city: 'Belém', state: 'Pará', stateCode: 'PA' },
  PB: { cep: '58010-000', city: 'João Pessoa', state: 'Paraíba', stateCode: 'PB' },
  PR: { cep: '80020-000', city: 'Curitiba', state: 'Paraná', stateCode: 'PR' },
  PE: { cep: '50010-000', city: 'Recife', state: 'Pernambuco', stateCode: 'PE' },
  PI: { cep: '64000-020', city: 'Teresina', state: 'Piauí', stateCode: 'PI' },
  RJ: { cep: '20040-002', city: 'Rio de Janeiro', state: 'Rio de Janeiro', stateCode: 'RJ' },
  RN: { cep: '59025-000', city: 'Natal', state: 'Rio Grande do Norte', stateCode: 'RN' },
  RS: { cep: '90020-000', city: 'Porto Alegre', state: 'Rio Grande do Sul', stateCode: 'RS' },
  RO: { cep: '76801-059', city: 'Porto Velho', state: 'Rondônia', stateCode: 'RO' },
  RR: { cep: '69301-000', city: 'Boa Vista', state: 'Roraima', stateCode: 'RR' },
  SC: { cep: '88010-400', city: 'Florianópolis', state: 'Santa Catarina', stateCode: 'SC' },
  SP: { cep: '01001-000', city: 'São Paulo', state: 'São Paulo', stateCode: 'SP' },
  SE: { cep: '49010-010', city: 'Aracaju', state: 'Sergipe', stateCode: 'SE' },
  TO: { cep: '77001-010', city: 'Palmas', state: 'Tocantins', stateCode: 'TO' },
};

export const DEFAULT_LOCATION: UserLocation = {
  cep: '01001-000',
  city: 'São Paulo',
  state: 'São Paulo',
  stateCode: 'SP',
  source: 'default',
};

export function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function saveLocationToStorage(location: UserLocation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch (err) {
    console.warn('Could not save location to localStorage', err);
  }
}

export function getSavedLocation(): UserLocation | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.cep) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read location from localStorage', err);
  }
  return null;
}

// Consulta dados reais de um CEP digitado na ViaCEP
export async function fetchLocationFromViaCep(rawCep: string): Promise<UserLocation | null> {
  const clean = rawCep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;

    const loc: UserLocation = {
      cep: data.cep || formatCep(clean),
      city: data.localidade || 'São Paulo',
      state: data.estado || data.uf || 'São Paulo',
      stateCode: (data.uf || 'SP').toUpperCase(),
      neighborhood: data.bairro || undefined,
      source: 'manual',
    };
    saveLocationToStorage(loc);
    return loc;
  } catch (err) {
    console.warn('ViaCEP fetch error:', err);
    return null;
  }
}

// Consulta geolocalização com coordenadas GPS
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<UserLocation | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const address = data.address || {};

    const rawPostcode = (address.postcode || '').replace(/\D/g, '');
    const city = address.city || address.town || address.municipality || address.village || address.suburb || 'Sua região';
    const state = address.state || 'Brasil';
    
    // Tenta extrair código do estado (ex: BR-SP -> SP)
    let stateCode = '';
    if (address['ISO3166-2-lvl4']) {
      stateCode = address['ISO3166-2-lvl4'].replace(/^BR-/i, '').toUpperCase();
    } else if (address.state) {
      const matchKey = Object.keys(STATE_DEFAULT_CEPS).find(
        (uf) => STATE_DEFAULT_CEPS[uf].state.toLowerCase() === address.state.toLowerCase()
      );
      if (matchKey) stateCode = matchKey;
    }

    let finalCep = '';
    if (rawPostcode.length >= 8) {
      finalCep = formatCep(rawPostcode);
    } else if (stateCode && STATE_DEFAULT_CEPS[stateCode]) {
      finalCep = STATE_DEFAULT_CEPS[stateCode].cep;
    } else {
      finalCep = '01001-000';
    }

    const loc: UserLocation = {
      cep: finalCep,
      city,
      state,
      stateCode: stateCode || 'BR',
      neighborhood: address.suburb || address.neighbourhood,
      source: 'gps',
    };
    saveLocationToStorage(loc);
    return loc;
  } catch (err) {
    console.warn('Nominatim reverse geocode error:', err);
    return null;
  }
}

// Consulta região aproximada por IP real do usuário
export async function detectLocationFromIp(): Promise<UserLocation | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (!data.success && data.message) return null;

    const countryCode = (data.country_code || '').toUpperCase();
    const city = data.city || '';
    const regionCode = (data.region_code || '').toUpperCase();
    const rawPostal = (data.postal || '').replace(/\D/g, '');

    // Se estiver no Brasil, busca pelo estado ou código postal
    if (countryCode === 'BR' || data.country === 'Brazil') {
      let finalCep = '';
      if (rawPostal.length >= 8) {
        finalCep = formatCep(rawPostal);
      } else if (regionCode && STATE_DEFAULT_CEPS[regionCode]) {
        finalCep = STATE_DEFAULT_CEPS[regionCode].cep;
      } else {
        finalCep = '01001-000';
      }

      const stateInfo = STATE_DEFAULT_CEPS[regionCode];

      const loc: UserLocation = {
        cep: finalCep,
        city: city || (stateInfo ? stateInfo.city : 'São Paulo'),
        state: data.region || (stateInfo ? stateInfo.state : 'São Paulo'),
        stateCode: regionCode || (stateInfo ? stateInfo.stateCode : 'SP'),
        source: 'ip',
      };
      saveLocationToStorage(loc);
      return loc;
    }
  } catch (err) {
    console.warn('IP geolocation fetch error:', err);
  }
  return null;
}

// Dispara pedido de GPS do navegador com fallback
export function requestGpsLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = await reverseGeocodeCoords(latitude, longitude);
        resolve(loc);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  });
}

// Função orquestradora completa para detecção automática inicial
export async function detectUserLocation(): Promise<UserLocation> {
  // 1. Tenta recuperar do localStorage (se o usuário já definiu ou detectou antes)
  const saved = getSavedLocation();
  if (saved) {
    return saved;
  }

  // 2. Tenta por IP (não pede permissão, instantâneo e não intrusivo para o usuário)
  const ipLoc = await detectLocationFromIp();
  if (ipLoc) {
    return ipLoc;
  }

  // 3. Tenta geolocalização do navegador
  try {
    const gpsLoc = await requestGpsLocation();
    if (gpsLoc) {
      return gpsLoc;
    }
  } catch {
    // Silently fall back
  }

  // 4. Retorna fallback padrão
  return DEFAULT_LOCATION;
}
