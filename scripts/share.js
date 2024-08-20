import { nanoid } from 'https://unpkg.com/nanoid@4.0.2/nanoid.js'
import 'https://unpkg.com/@supabase/supabase-js@2'

export default function Share () {
    console.log('Share loaded');
    // Create a single supabase client for interacting with your database
    const { createClient } = supabase
    const supabaseDB = createClient(
        'https://mmtwvclhickzbiefqlko.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdHd2Y2xoaWNremJpZWZxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwODg5ODEsImV4cCI6MjAzOTY2NDk4MX0.ttZiuWWH8cHYDQ1k_qexQaI0NMwDRKLVuJoZF1xR1U8',
    );
    this.initCode = async () => {
        try {
            const initialUrl = window.location.href;
            const hash = initialUrl.split('?')[1]?.split('#')?.[0];
            const codeParam = window.location.href.split('#')[1];
            if (codeParam) {
                // looking like https://karstenj.github.io/orca-play/#ImMzIGUzIg%3D%3D (hash length depends on code length)
                return atob(decodeURIComponent(codeParam || ''));
            } else if (hash) {
                return supabaseDB
                    .from('code')
                    .select('code')
                    .eq('hash', hash)
                    .then(({ data, error }) => {
                    if (error) {
                        console.warn('failed to load hash', err);
                    }
                    if (data.length) {
                        console.log('load hash from database', hash);
                        return data[0].code;
                    }
                });
            }
        } catch (err) {
          console.warn('failed to load code', err);
        }         
    }
    this.handleShare = async (codeToShare) => {
        const hash = nanoid(12);
        const shareUrl = window.location.origin + window.location.pathname + '?' + hash;
        const { data, error } = await supabaseDB.from('code').insert([{ code: codeToShare, hash }]);
        if (!error) {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(shareUrl);
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = shareUrl;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
                const message = `Link copied to clipboard: ${shareUrl}`;
                alert(message);
                console.log(message);
            } catch (err) {
                const message = `Failed to copy: ${err.message}`;
                alert(message);
                console.log(message);
            }
        } else {
            const message = `Error: ${error.message}`;
            alert(message);
            console.log(message);
        }
    };
}