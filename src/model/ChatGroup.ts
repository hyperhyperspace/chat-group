import { CausalSet, HashedObject, Identity, MultiAuthorCausalSet, MutableObject, PeerNode, SingleAuthorCausalSet, SpaceEntryPoint } from '@hyper-hyper-space/core';
import { Feature, AllFeatures } from './ChatConfig';
import { MemberSet } from './MemberSet';
import { MessageSet } from './MessageSet';

class ChatGroup extends HashedObject implements SpaceEntryPoint {
    
    static className = 'chat-group/v0/model/ChatGroup';

    admins?  : CausalSet<Identity>;
    members? : MemberSet;

    enabledFeatures?: MultiAuthorCausalSet<Feature>;

    messages?: MessageSet;

    _node?: PeerNode;

    _mutables?: Array<MutableObject>;

    constructor(owner?: Identity) {
        super();

        if (owner !== undefined) {
            this.setRandomId();
            this.setAuthor(owner);

            this.admins = new SingleAuthorCausalSet<Identity>(owner, [Identity.className]);
            this.addDerivedField('admins', this.admins);

            this.enabledFeatures = new MultiAuthorCausalSet(this.admins, ['string'], AllFeatures);
            this.addDerivedField('enabledFeatures', this.enabledFeatures);

            this.members = new MemberSet(this.admins, this.enabledFeatures);
            this.addDerivedField('members', this.members);

            this.messages = new MessageSet(this.admins, this.members);
            this.addDerivedField('messages', this.messages);
        }

    }

    init(): void {
        this._mutables = [this.admins, this.enabledFeatures, this.members, this.members] as Array<MutableObject>;
    }

    async validate(references: Map<string, HashedObject>): Promise<boolean> {
        references;

        if (!this.checkDerivedField('admins')) {
            return false;
        }

        if (!(this.admins instanceof SingleAuthorCausalSet)) {
            return false;
        }

        if (!((this.getAuthor() as Identity).equals(this.admins.getAuthor()))) {
            return false;
        }

        if (!this.admins.checkAcceptedElementsIsMissing() || !this.admins.checkAcceptedTypes([Identity.className])) {
            return false;
        }

        if (!this.checkDerivedField('enabledFeatures')) {
            return false;
        }

        if (!(this.enabledFeatures instanceof MultiAuthorCausalSet)) {
            return false;
        }

        if (!this.enabledFeatures.checkAcceptedElements(AllFeatures) || !this.enabledFeatures.checkAcceptedTypes(['string'])) {
            return false;
        }

        if (this.enabledFeatures?.getAuthor() !== undefined) {
            return false;
        }

        if (!this.getAdmins().equals(this.enabledFeatures.getAuthorizedIdentitiesSet())) {
            return false;
        }

        if (!this.checkDerivedField('members')) {
            return false;
        }

        if (!(this.members instanceof MemberSet)) {
            return false;
        }

        if (!this.getAdmins().equals(this.members.getAdmins())) {
            return false;
        }

        if (!this.getEnabledFeatures().equals(this.members.getEnabledFeatures())) {
            return false;
        }

        if (!this.checkDerivedField('messages')) {
            return false;
        }

        if (!(this.messages instanceof MessageSet)) {
            return false;
        }

        if (!(this.getAdmins().equals(this.getMessages().getAdmins()))) {
            return false;
        }

        if (!(this.getMembers().equals(this.getMessages().getMembers()))) {
            return false;
        }

        return true;
    }

    getClassName(): string {
        return ChatGroup.className;
    }

    async startSync(): Promise<void> {
        let resources = this.getResources();

        if (resources === undefined) {
            throw new Error('Cannot start sync: resources not configured.');
        }

        if (resources.config?.id === undefined) {
            throw new Error('Cannot start sync: local identity has not been defined.');
        }

        if (resources.store === undefined) {
            throw new Error('Cannot start sync: a local store has not been configured.')
        }

        this._node = new PeerNode(resources);
        
        this._node.broadcast(this);
        this._node.sync(this);
    }

    getAdmins() {
        return this.admins as SingleAuthorCausalSet<Identity>;
    }

    getMembers() {
        return this.members as MemberSet;
    }

    getEnabledFeatures() {
        return this.enabledFeatures as CausalSet<Feature>;
    }

    getMessages() {
        return this.messages as MessageSet;
    }

    watchForChanges(auto: boolean): boolean {
        
        for (const mut of (this._mutables as Array<MutableObject>).values()) {
            mut.watchForChanges(auto);
        }

        return auto;
    }

    async loadAllChanges() {
        for (const mut of (this._mutables as Array<MutableObject>).values()) {
            await mut.loadAllChanges();
        }
    }

    async loadAndWatchForChanges() {
        this.watchForChanges(true);
        return this.loadAllChanges();
    }
    
    async stopSync(): Promise<void> {
        this._node?.stopBroadcast(this);
        this._node?.stopSync(this);
    }
}

HashedObject.registerClass(ChatGroup.className, ChatGroup);