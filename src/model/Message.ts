import { HashedObject, Identity } from '@hyper-hyper-space/core';


class Message extends HashedObject {

    static className = 'chat-group/v0/model/Message';

    text?: string;
    timestamp?: number;

    constructor(author?: Identity, text?: string, timestamp?: number) {
        super();
    
        if (author !== undefined) {
            this.setAuthor(author);
            this.text = text;
            this.timestamp = timestamp !== undefined? timestamp : Date.now();
        }
    }

    getClassName(): string {
        return Message.className;
    }

    init(): void {
        
    }

    async validate(_references: Map<string, HashedObject>): Promise<boolean> {
        return this.text !== undefined && this.timestamp !== undefined && 
               this.getAuthor() !== undefined && this.getAuthor() instanceof Identity;
    }

}

HashedObject.registerClass(Message.className, Message);

export { Message };