import { Identity, MutableSet } from '@hyper-hyper-space/core';
import { Message } from './Message';
import { UserSet } from './UserSet';


class MessageSet extends MutableSet<Message> {

    users?: UserSet;

    constructor(users?: UserSet) {
        super();

        if (users !== undefined) {
            this.users = users;
            this.setAuthor(users.getAuthor() as Identity);
        }
    }

}

export { MessageSet }