import { useState, useEffect, useCallback } from 'react';
import * as kuromoji from 'kuromoji';

// Katakana to Hiragana conversion utility
function katakanaToHiragana(katakana) {
  return katakana.replace(/[ァ-ン]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

function App() {
  const [text, setText] = useState('日本語を勉強しています。');
  const [rubyHtml, setRubyHtml] = useState('');
  const [tokenizer, setTokenizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Kuromoji tokenizer
    kuromoji
      .builder({ dicPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/' })
      .build((err, tokenizer) => {
        if (err) {
          console.error('Kuromoji build error:', err);
          // You might want to show an error message to the user
          setLoading(false);
          return;
        }
        setTokenizer(() => tokenizer);
        setLoading(false);
      });
  }, []);

  const generateRuby = useCallback(() => {
    if (!tokenizer || !text) {
      setRubyHtml('');
      return;
    }

    const tokens = tokenizer.tokenize(text);
    const html = tokens.reduce((acc, token) => {
      const word = token.surface_form;
      const reading = token.reading; // This is in Katakana

      // Check if the word contains Kanji and has a reading
      if (reading && reading !== '*' && /[\u4e00-\u9faf]/.test(word)) {
        const hiraganaReading = katakanaToHiragana(reading);
        // Add ruby tags only if the reading is different from the word itself
        if (hiraganaReading !== word) {
          return acc + `<ruby>${word}<rt>${hiraganaReading}</rt></ruby>`;
        }
      }
      return acc + word;
    }, '');

    setRubyHtml(html);
  }, [tokenizer, text]);
  
  // Automatically generate ruby for the default text on load
  useEffect(() => {
    if (tokenizer) {
      generateRuby();
    }
  }, [tokenizer, generateRuby]);


  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-10 col-lg-8 mx-auto">
          <h1 className="mb-4 text-center">Furigana Generator (ルビ振りツール)</h1>
          <p className="text-muted text-center">
            日本語の文章を入力して、「変換」ボタンを押してください。
          </p>
          
          <textarea
            className="form-control"
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ここに日本語の文章を入力..."
          ></textarea>

          <button
            className="btn btn-primary mt-3 w-100"
            onClick={generateRuby}
            disabled={loading || !text}
          >
            {loading ? '辞書を読み込み中...' : '変換 (Convert)'}
          </button>

          <hr className="my-4" />

          <h2>結果 (Result):</h2>
          <div
            className="p-3 border rounded bg-light text-break"
            style={{ minHeight: '100px', fontSize: '1.2rem' }}
            dangerouslySetInnerHTML={{ __html: rubyHtml }}
          />
          
          <h2 className="mt-4">HTML:</h2>
          <pre className="p-3 border rounded bg-dark text-white text-break">
            <code>{rubyHtml}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;