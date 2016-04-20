import RetroRow from '../retrorow';
import {Observable} from "rxjs/Observable";
import {RetroItem} from "../../store/retroitem";

describe('RetroRow', () => {
    var mockStore;

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
            getBoard: function () {
            },
            addItem: function () {
            },
            updateItem: function () {
            }
        };
    });

    it('should tell the store to update an item and update the board', () => {
        let initialItem = buildRetroItem(1, 1, "I'm a message", 'ACTIVE', 'HAPPY', 0, "2016-01-01T21:30:00Z", "2016-01-01T21:30:00Z");
        let retroRow = new RetroRow(mockStore);
        retroRow.item = initialItem;
        let expectedItem = buildRetroItem(1, 1, "I'm a message", 'ARCHIVED', 'HAPPY', 0, "2016-01-01T21:30:00Z", "2016-01-01T21:30:00Z");

        mockStore.updateItem = function (item) {
            expect(item).toEqual(expectedItem);
            return Observable.create(observer => {
                observer.next(null);
                observer.complete();
            })
        };

        spyOn(mockStore, 'updateItem').and.callThrough();
        retroRow.archive();

        expect(mockStore.updateItem).toHaveBeenCalledWith(expectedItem);
        expect(retroRow.item.status).toBe('ARCHIVED');
    });

    it('should handle an error while archiving an item', () => {
        let initialItem = buildRetroItem(1, 1, "I'm a message", 'ACTIVE', 'HAPPY', 0, "2016-01-01T21:30:00Z", "2016-01-01T21:30:00Z");
        let retroRow = new RetroRow(mockStore);
        retroRow.item = initialItem;

        var error = new Error("Some problem");
        mockStore.updateItem = function () {
            return Observable.throw(error);
        };
        spyOn(mockStore, 'updateItem').and.callThrough();

        retroRow.archive();

        expect(retroRow.item.status).toBe('ACTIVE');
    });
});


