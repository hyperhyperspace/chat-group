import { HashedObject, Identity, SpaceEntryPoint } from '@hyper-hyper-space/core';
import { MessageSet } from './MessageSet';
import { UserSet } from './UserSet';


class ChatGroup extends HashedObject implements SpaceEntryPoint {
    
    static className = 'chat-group/v0/model/ChatGroup';

    users?: UserSet;
    messages?: MessageSet;

    constructor(owner?: Identity) {
        super();

        if (owner !== undefined) {
            this.setAuthor(owner);
            this.users = new UserSet(owner);
        }

    }

    init(): void {
        
    }

    async validate(references: Map<string, HashedObject>): Promise<boolean> {
        references;
        return true;
    }

    getClassName(): string {
        return ChatGroup.className;
    }

    startSync(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    
    stopSync(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

HashedObject.registerClass(ChatGroup.className, ChatGroup);