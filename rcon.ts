import {Rcon} from 'rcon-client';

export class RconClient {
    private rcon: Promise<Rcon>;
    private running: boolean;
    constructor(host: string, port: number, password: string) {
        this.rcon = Rcon.connect({
            host, port, password
        });
        this.running = true;
    }

    public async sendCommand(command: string): Promise<string> {
        if(!this.running) throw new Error("Unable to send commands for a closed connection");
        return (await this.rcon).send(command);
    }

    public async players(): Promise<string[]> {
        const res = await this.sendCommand('players');
        return res.split('\n').slice(1).filter(x => x != '').map(x => x.substring(1));
    }

    public async end(): Promise<void> {
        (await this.rcon).end();
        this.running = false;
    }
}