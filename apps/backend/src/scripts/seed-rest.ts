// Testdaten-Seed per REST-API für Payload CMS
// Node 18+: fetch ist global verfügbar

const API_URL = 'http://localhost:3000/api';

let authCookie = '';

const userData = {
  email: 'test@example.com',
  password: 'test123',
  name: 'Test User'
};

async function registerUser() {
  // Versuche User zu registrieren
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (res.ok) {
    console.log('✅ User registriert:', userData.email);
    return true;
  } else {
    const data = await res.json();
    if (data.errors && data.errors[0]?.message?.includes('already')) {
      console.log('ℹ️ User existiert bereits, mache einfach weiter:', userData.email);
      return true; // einfach weitermachen, als wäre der User registriert worden
    }
    throw new Error('User konnte nicht registriert werden: ' + JSON.stringify(data));
  }
}

async function loginAndGetCookie() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password
    })
  });
  if (!res.ok) {
    throw new Error('Login fehlgeschlagen: ' + (await res.text()));
  }
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    authCookie = setCookie.split(';')[0];
    console.log('✅ Login erfolgreich, Auth-Cookie erhalten.');
  } else {
    throw new Error('Kein Auth-Cookie erhalten!');
  }
}

const kategorien = [
  {
    name: 'Café',
    isActive: true,
    icon: '☕',
    color: '#FFD700',
    sortOrder: 1,
    description: 'Testkategorie Café'
  },
  {
    name: 'Restaurant',
    isActive: true,
    icon: '🍽️',
    color: '#FF6347',
    sortOrder: 2,
    description: 'Testkategorie Restaurant'
  },
  {
    name: 'Bar',
    isActive: true,
    icon: '🍸',
    color: '#8A2BE2',
    sortOrder: 3,
    description: 'Testkategorie Bar'
  },
  {
    name: 'Museum',
    isActive: true,
    icon: '🏛️',
    color: '#4682B4',
    sortOrder: 4,
    description: 'Testkategorie Museum'
  },
  {
    name: 'Park',
    isActive: true,
    icon: '🌳',
    color: '#228B22',
    sortOrder: 5,
    description: 'Testkategorie Park'
  }
];

async function createCategories() {
  const categoryIds: string[] = [];
  for (const kategorie of kategorien) {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify(kategorie)
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Kategorie erstellt:', data.doc.name);
      categoryIds.push(data.doc.id);
    } else {
      if (data.errors && data.errors[0]?.message?.includes('already')) {
        // Kategorie existiert schon, ID holen
        const getRes = await fetch(`${API_URL}/categories?where%5Bname%5D%5Bequals%5D=${encodeURIComponent(kategorie.name)}`, { headers: { 'Cookie': authCookie } });
        const getData = await getRes.json();
        if (getData.docs && getData.docs[0]) {
          categoryIds.push(getData.docs[0].id);
        } else {
          throw new Error('Kategorie existiert, aber konnte nicht gefunden werden: ' + kategorie.name);
        }
      } else {
        throw new Error('Kategorie konnte nicht erstellt werden: ' + JSON.stringify(data));
      }
    }
  }
  return categoryIds;
}

async function getUserId() {
  const getRes = await fetch(`${API_URL}/users?where%5Bemail%5D%5Bequals%5D=${encodeURIComponent(userData.email)}`, { headers: { 'Cookie': authCookie } });
  const getData = await getRes.json();
  if (getData.docs && getData.docs[0]) {
    return getData.docs[0].id;
  } else {
    throw new Error('Test-User nicht gefunden!');
  }
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomLatLng(): { latitude: number; longitude: number } {
  // Berlin Umgebung
  const lat = 53.1 + Math.random() * 0.2;
  const lng = 8.7 + Math.random() * 0.3;
  return { latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lng.toFixed(6)) };
}

async function createLocation(categoryId: string, userId: string, idx: number): Promise<string> {
  const name = `Test Location ${idx + 1} - ${randomString(5)}`;
  const res = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
    body: JSON.stringify({
      name,
      category: categoryId,
      coordinates: [randomLatLng().longitude, randomLatLng().latitude],
      address: {
        street: `Teststraße ${idx + 1}`,
        city: 'Bremen',
        postalCode: `282${idx % 10}${idx}`,
        country: 'Deutschland'
      },
      status: 'active',
      createdBy: userId
    })
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Location ${idx + 1} erstellt:`, data.doc.name);
    return data.doc.id;
  } else {
    if (data.errors && data.errors[0]?.message?.includes('already')) {
      const getRes = await fetch(`${API_URL}/locations?where%5Bname%5D%5Bequals%5D=${encodeURIComponent(name)}`, { headers: { 'Cookie': authCookie } });
      const getData = await getRes.json();
      return getData.docs[0]?.id;
    }
    throw new Error('Location konnte nicht erstellt werden: ' + JSON.stringify(data));
  }
}

async function createReview(locationId: string, userId: string, idx: number): Promise<string | null> {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
    body: JSON.stringify({
      location: locationId,
      user: userId,
      rating: 4 + (idx % 2),
      comment: `Automatisches Review für Location ${idx + 1}`,
      status: 'active'
    })
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`⭐ Review für Location ${idx + 1} erstellt.`);
    return data.doc.id;
  } else {
    if (data.errors && data.errors[0]?.message?.includes('already')) {
      return null;
    }
    throw new Error('Review konnte nicht erstellt werden: ' + JSON.stringify(data));
  }
}

async function createFavorite(locationId: string, userId: string, idx: number): Promise<string | null> {
  const res = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
    body: JSON.stringify({
      user: userId,
      location: locationId
    })
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`❤️ Favorite für Location ${idx + 1} erstellt.`);
    return data.doc.id;
  } else {
    if (data.errors && data.errors[0]?.message?.includes('already')) {
      return null;
    }
    throw new Error('Favorite konnte nicht erstellt werden: ' + JSON.stringify(data));
  }
}

async function createReport(locationId: string, userId: string, idx: number): Promise<string | null> {
  const res = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
    body: JSON.stringify({
      location: locationId,
      reportedBy: userId,
      reason: 'inappropriate',
      description: `Automatischer Report für Location ${idx + 1}`,
      status: 'open',
      adminNotes: 'Automatisch generiert.'
    })
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`🚩 Report für Location ${idx + 1} erstellt.`);
    return data.doc.id;
  } else {
    if (data.errors && data.errors[0]?.message?.includes('already')) {
      return null;
    }
    throw new Error('Report konnte nicht erstellt werden: ' + JSON.stringify(data));
  }
}

async function main() {
  try {
    await registerUser();
    await loginAndGetCookie();
    const categoryIds = await createCategories();
    // Wähle eine zufällige Kategorie-ID aus
    const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    const userId = await getUserId();
    const locationIds = [];
    for (let i = 0; i < 20; i++) {
      const locId = await createLocation(categoryId, userId, i);
      locationIds.push(locId);
    }
    // Für die ersten 5 Locations Reviews, Favorites, Reports anlegen
    for (let i = 0; i < 5; i++) {
      await createReview(locationIds[i], userId, i);
      await createFavorite(locationIds[i], userId, i);
      await createReport(locationIds[i], userId, i);
    }
    console.log('🎉 Alle Testdaten erfolgreich per REST-API angelegt!');
  } catch (err) {
    console.error('❌ Fehler beim Seed:', err);
    process.exit(1);
  }
}

main();
