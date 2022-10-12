import { Authorization, Authorizer, CausalSet, ClassRegistry, Hash, HashedObject, Identity } from '@hyper-hyper-space/core';
import { Message } from './Message';


class MessageSet extends CausalSet<Message> {

    static className = 'chat-group/v0/model/MessageSet';

    moderators? : CausalSet<Identity>;
    members?    : CausalSet<Identity>;

    constructor(moderators?: CausalSet<Identity>, members?: CausalSet<Identity>) {
        super({acceptedTypes: [Message.className]});

        if (moderators !== undefined) {
            this.moderators = moderators;

            if (members === undefined) {
                throw new Error('MessageSet: cannot construct without a members set');
            }
            
            this.members = members;
        }
    }

    async post(elmt: Message): Promise<boolean> {

        const author = elmt.getAuthor();

        if (author === undefined) {
            throw new Error('A Message must have an author in order to add it to a MessageSet');
        }

        return super.add(elmt, author);
    }

    async validate(references: Map<Hash, HashedObject>): Promise<boolean> {

        if (!await super.validate(references)) {
            return false;
        }

        if (!this.getAuthor() === undefined) {
            return false;
        }

        if (this.moderators === undefined) {
            return false;
        }

        if (!(this.moderators instanceof CausalSet)) {
            return false;
        }

        if (this.members === undefined) {
            return false;
        }

        if (!(this.members instanceof CausalSet)) {
            return false;
        }

        if (!this.checkAcceptedTypes([Message.className])) {
            return false;
        }

        if (!this.checkAcceptedElementsIsMissing()) {
            return false;
        }

        return true;
    }

    async delete(elmt: Message, author: Identity): Promise<boolean> {
        return this.deleteByHash(HashedObject.hashElement(elmt), author);
    }

    async deleteByHash(elmtHash: Hash, author: Identity): Promise<boolean> {
        return super.deleteByHash(elmtHash, author);
    }

    getAdmins() {
        return this.moderators as CausalSet<Identity>;
    }

    getMembers() {
        return this.members as CausalSet<Identity>;
    }

    getClassName() {
        return MessageSet.className;
    }

    protected createAddAuthorizer(msg: Message, author: Identity): Authorizer {

        // only members may post messages, and they can't post messags authored
        // by someone else.

        if (!author.equals(msg.getAuthor())) {
            return Authorization.never;
        }

        const isMemberAuth = this.getMembers().createMembershipAuthorizer(author);

        return Authorization.chain(super.createAddAuthorizer(msg, author), isMemberAuth);
    }

    protected createDeleteAuthorizer(msg: Message, author: Identity): Authorizer {

        // any member may delete their own messages, but only moderators can delete other's

        const membershipReq = author.equals(msg.getAuthor()) ?
                                                                this.getMembers()
                                                             :
                                                                this.getAdmins();

        const membershipAuth = membershipReq.createMembershipAuthorizer(author);

        return Authorization.chain(super.createDeleteAuthorizer(msg, author), membershipAuth);
    }

    protected createDeleteAuthorizerByHash(_msgHash: Hash, _author: Identity): Authorizer {

        // this set does not support removal of elements by their hashes

        return Authorization.never;
    }

}

ClassRegistry.register(MessageSet.className, MessageSet);

export { MessageSet }