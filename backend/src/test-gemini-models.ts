const keys = [
  'AQ.Ab8RN6LGqcVKgrq7XVj8N_Mb7t2zkLAD3QQNWXY3ePFpfE0bvA',
  'AQ.Ab8RN6J7Qqv2VUpDOvOvALYTsssf01V3LAZM0aO3KLgLlCxDSQ',
  'AQ.Ab8RN6KMFJyODHPORpXB9h8h40bXzTl5nZ4kxtNAwlu9pCKQaA',
  'AQ.Ab8RN6L6K1EwzNtplwT3IV1dUgbUNw-CXd2I6Ym_8Vt12wQT_g',
];

const models = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

async function testCombination(key: string, keyIdx: number, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hola' }] }],
      }),
    });
    const json: any = await res.json();
    if (res.ok) {
      console.log(`✅ SUCCESS! Key #${keyIdx} with Model '${model}': Response =`, json?.candidates?.[0]?.content?.parts?.[0]?.text);
      return true;
    } else {
      console.log(`❌ Key #${keyIdx} with Model '${model}' Status ${res.status}:`, json?.error?.message || JSON.stringify(json));
      return false;
    }
  } catch (err: any) {
    console.error(`Error testing Key #${keyIdx} / ${model}:`, err.message);
    return false;
  }
}

async function run() {
  for (let k = 0; k < keys.length; k++) {
    for (let m = 0; m < models.length; m++) {
      await testCombination(keys[k], k, models[m]);
    }
  }
}

run();
