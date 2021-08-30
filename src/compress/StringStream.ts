import { Readable } from 'stream';

export class StringStream extends Readable {
  private ended: boolean = false;

  constructor(private str: string) {
    super();
  }

  _read(): void {
    if (!this.ended) {
      process.nextTick(() => {
        this.push(Buffer.from(this.str, 'utf8'));
        this.push(null);
      });
      this.ended = true;
    }
  }
}
