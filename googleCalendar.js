const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// These would normally come from your Google Cloud Console
// But for now, since it's a test, I am creating a structure.
// You will need to put YOUR actual Client ID and Secret here later.
let CREDENTIALS_PATH;
let TOKEN_PATH;

class GoogleCalendarService {
    constructor() {
        this.oAuth2Client = null;
        this.credentials = null;
    }

    init(userDataPath) {
        CREDENTIALS_PATH = path.join(userDataPath, 'google_credentials.json');
        TOKEN_PATH = path.join(userDataPath, 'token.json');
        this.credentials = this.loadCredentials();
    }

    loadCredentials() {
        if (CREDENTIALS_PATH && fs.existsSync(CREDENTIALS_PATH)) {
            return JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
        }
        return null;
    }

    async authenticate() {
        if (!this.credentials) {
            throw new Error('Please provide google_credentials.json from Google Cloud Console.');
        }

        const { client_id, client_secret, redirect_uris } = this.credentials.installed;
        this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Check if we have social tokens saved
        if (fs.existsSync(TOKEN_PATH)) {
            const token = fs.readFileSync(TOKEN_PATH);
            this.oAuth2Client.setCredentials(JSON.parse(token));
            return this.oAuth2Client;
        }

        return this.getNewToken();
    }

    async getNewToken() {
        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar.events'],
        });

        console.log('Authorize this app by visiting this url:', authUrl);
        
        // Dynamically import 'open' as it is an ES Module
        const { default: openApp } = await import('open');
        await openApp(authUrl);

        return new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                if (req.url.indexOf('/oauth2callback') > -1) {
                    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                    const code = qs.get('code');
                    res.end('Authentication successful! You can close this window now.');
                    server.close();

                    const { tokens } = await this.oAuth2Client.getToken(code);
                    this.oAuth2Client.setCredentials(tokens);
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                    resolve(this.oAuth2Client);
                }
            }).listen(3000);
        });
    }

    async syncTasksToCalendar(tasks) {
        if (!this.oAuth2Client) await this.authenticate();
        const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

        for (const task of tasks) {
            if (!task.deadline) continue;

            const event = {
                summary: `[Task] ${task.title}`,
                description: task.description || '',
                start: { date: task.deadline },
                end: { date: task.deadline },
            };

            try {
                await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event,
                });
                console.log(`Synced task: ${task.title}`);
            } catch (error) {
                console.error(`Error syncing task ${task.title}:`, error);
            }
        }
    }
}

module.exports = new GoogleCalendarService();
