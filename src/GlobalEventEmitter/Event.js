/**
 * Created by vladi on 25-Jan-17.
 */
import EventListener from './EventListener';
import {
    dispatchEvent,
    getUid,
    BasicEvent,
    addEventListener,
    removeEventListenersByType,
    listenerExists,
    filterRemovedListeners
} from './EventsControl';
class EventException {
    constructor(message) {
        this.message = message;
        this.name = "EventException";
    }
}
export default class Event extends BasicEvent {
    constructor(eventData) {
        super();
        //i don't want to keep the event prototype or constructor for comparing i will create unique id per constructor
        this.constructor.prototype.__listenersList =
            this.constructor.prototype.__listenersList || [];
        this.constructor.prototype._uid =
            this.constructor.prototype._uid || getUid();
        this.constructor.prototype._eventState =
            this.constructor.prototype._eventState || {...(this.constructor.defaultEventState || {})};
        this.constructor.prototype._isDispatching =
            this.constructor.prototype._isDispatching === undefined ? false : this.constructor.prototype._isDispatching;
        this._data = {...(eventData || {})};
        this.updateEventList =
            this.__listenersList =
                this.removeEventListener =
                    this.addEventListener =
                        this._isDispatching =
                            this._eventState =
                                this._uid = undefined;
    }

    get uid() {
        return this.constructor.prototype._uid;
    }

    get eventState() {
        return {...this.constructor.prototype._eventState};
    }

    get eventData() {
        return {...this._data};
    }

    dispatch() {
        if (this.constructor.prototype._isDispatching) {
            throw new EventException("Event-ception - (Event fired withing itself) detected at:" + this.constructor.name);
        }
        this.constructor.prototype._isDispatching = true;
        this.constructor.prototype._eventState = Object.assign(this.constructor.prototype._eventState, this._data);
        dispatchEvent(this);
        this.constructor.prototype._isDispatching = false;
    }

    static updateEventList() {
        console.log("Event->updateEventList");
        this.constructor.prototype.__listenersList =
            filterRemovedListeners(
                this.constructor.prototype.__listenersList
            );
    }

    static removeEventListener(eventListener) {
        if (typeof eventListener !== 'object' || !EventListener.isPrototypeOf(eventListener)) {
            return;
        }
        eventListener.remove();
        this.constructor.updateEventList();
    }

    static clearAllDirectEvents() {
        removeEventListenersByType(
            this.uid, this.constructor.prototype.__listenersList
        );
        this.constructor.prototype.__listenersList = [];
    }

    static addEventListener(handler) {
        const listenerUid = addEventListener({
            _active: true,
            _eventUid: this.uid,
            _handler: handler
        });
        this.constructor.prototype.__listenersList.push(listenerUid);
        return new EventListener(
            listenerUid,
            this.constructor.updateEventList.bind(this)
        );
    }

    static get eventState() {
        return this.prototype._eventState || (new this()).eventState;
    }

    static get uid() {
        return this.prototype._uid || (new this()).uid;
    }
}



