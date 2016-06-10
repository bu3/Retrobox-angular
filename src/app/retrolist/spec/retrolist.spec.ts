import RetroList from '../retrolist';
import {Observable} from "rxjs/Observable";
import {RetroItem} from "../../store/retroitem";
import {FormBuilder, Control, Validators, Validator} from "angular2/common";

describe('RetroList', () => {
    var mockStore;
    var formBuilder;
    var getItemsSpy;

    function buildRetroItem(id, boardId, message, status, type, likes, creationDate, lastModifiedDate) {
        let item1 = new RetroItem({
            boardId: boardId,
            id: id,
            message: message,
            status: status,
            type: type,
            likes: likes
        });
        item1.creationDate = creationDate;
        item1.lastModifiedDate = lastModifiedDate;
        return item1;
    }

    beforeEach(function () {
        mockStore = {
            getItems: function () {
            },
            addItem: function () {
            },
            updateItem: function () {
            },
            deleteItem: function () {
            }
        };

        formBuilder = new FormBuilder();

        getItemsSpy = spyOn(mockStore, 'getItems').and.returnValue(
            Observable.create(observer => {
                observer.next([
                    buildRetroItem(1, 1, "I'm a message", 'ACTIVE', 'HAPPY', 0, "2016-01-01T21:30:00Z", "2016-01-01T21:30:00Z"),
                    buildRetroItem(2, 1, "I'm another message", 'ACTIVE', 'HAPPY', 3, "2016-01-01T21:30:00Z", "2016-01-01T21:30:00Z"),
                    buildRetroItem(3, 1, "I'm a different message", 'ACTIVE', 'UNHAPPY', 1, "2016-01-01T21:32:00Z", "2016-01-01T21:32:00Z"),
                    buildRetroItem(4, 1, "I'm a different message", 'ARCHIVED', 'MEDIOCRE', 1, "2016-01-01T21:32:00Z", "2016-01-01T21:32:00Z")]
                );
                observer.complete();
            })
        );
    });

    it('should load the board when created', () => {
        let retroList = new RetroList(mockStore, formBuilder);
        expect(getItemsSpy.calls.count()).toBe(1);
        expect(retroList.items).not.toBe(null);

        expect(retroList.happyItems.length).toBe(2);
        expect(retroList.happyItems[0].id).toBe(1);
        expect(retroList.happyItems[0].likes).toBe(0);
        expect(retroList.happyItems[1].id).toBe(2);
        expect(retroList.happyItems[1].likes).toBe(3);

        expect(retroList.mediocreItems.length).toBe(1);

        expect(retroList.unhappyItems.length).toBe(1);
    });

    it('should load the board when created and sort by likes if requested', () => {
        let retroList = new RetroList(mockStore, formBuilder);
        retroList.switchOrderByLikes();

        expect(getItemsSpy.calls.count()).toBe(2);
        expect(retroList.items).not.toBe(null);

        expect(retroList.happyItems.length).toBe(2);
        expect(retroList.happyItems[0].id).toBe(2);
        expect(retroList.happyItems[0].likes).toBe(3);
        expect(retroList.happyItems[1].id).toBe(1);
        expect(retroList.happyItems[1].likes).toBe(0);
        
        expect(retroList.mediocreItems.length).toBe(1);
        
        expect(retroList.unhappyItems.length).toBe(1);
    });

    it('should handle an error while getting the board', () => {
        var error = new Error("Some problem");
        mockStore.getItems = function () {
            return Observable.throw(error);
        };
        spyOn(mockStore, 'getItems').and.callThrough();

        let retroList = new RetroList(mockStore, formBuilder);
        expect(retroList.storeError).toBe(error);
    });

    it('should tell the store to add an item and update the board', () => {
        let retroList = new RetroList(mockStore, formBuilder);
        let expectedItem = new RetroItem({boardId: 1, message: 'foo', type: 'HAPPY'});

        mockStore.addItem = function (item) {
            expect(item).toEqual(expectedItem);
            return Observable.create(observer => {
                observer.next(null);
                observer.complete();
            })
        };

        spyOn(mockStore, 'addItem').and.callThrough();

        retroList.happyMessage = new Control('foo', Validators.required);

        retroList.addItem('HAPPY');

        expect(mockStore.addItem).toHaveBeenCalledWith(expectedItem);
        setTimeout(function () {
            //The framework takes some time to rebuild the form and re-bind the controls
            expect(retroList.happyMessage.value).toEqual('');
        }, 100);
        expect(getItemsSpy.calls.count()).toBe(2);
    });

    it('should handle an error while adding an item', () => {
        var error = new Error("Some problem");
        mockStore.addItem = function () {
            return Observable.throw(error);
        };
        spyOn(mockStore, 'addItem').and.callThrough();

        let retroList = new RetroList(mockStore, formBuilder);
        retroList.happyMessage = new Control('Test message', Validators.required);
        retroList.addItem('HAPPY');

        expect(retroList.storeError).toBe(error);
    });

    it('should change the status filter', () => {
        let retroList = new RetroList(mockStore, formBuilder);

        expect(retroList.filterArgs.status).toBe("ACTIVE");
        retroList.switchStatusFilter();
        expect(retroList.filterArgs.status).toBe("ARCHIVED");
        retroList.switchStatusFilter();
        expect(retroList.filterArgs.status).toBe("ACTIVE");
    });

    it('should tell the store to delete an item and update the list of items', () => {
        let retroList = new RetroList(mockStore, formBuilder);

        mockStore.deleteItem = function (itemId) {
            expect(itemId).toEqual(1);
            return Observable.create(observer => {
                observer.next(null);
                observer.complete();
            })
        };

        spyOn(mockStore, 'deleteItem').and.callThrough();
        retroList.removeItem(1);

        expect(mockStore.deleteItem).toHaveBeenCalledWith(1);
        expect(getItemsSpy.calls.count()).toBe(2);
    });

    it('should handle an error while deleting an item', () => {
        var error = new Error("Some problem");
        mockStore.deleteItem = function () {
            return Observable.throw(error);
        };
        spyOn(mockStore, 'deleteItem').and.callThrough();

        let retroList = new RetroList(mockStore, formBuilder);
        retroList.removeItem(1);

        expect(retroList.storeError).toBe(error);
    });
});



