import {HTTP_PROVIDERS, XHRBackend, RequestMethod, ResponseOptions, Response} from "angular2/http";
import {MockBackend} from "angular2/src/http/backends/mock_backend";
import {provide} from "angular2/core";
import RetroStore from "../app/store/retrostore";
import {beforeEachProviders, it, fit, injectAsync} from "angular2/testing";
import {RetroItem} from "../app/store/retroitem";

describe('RetroStore', () => {

    beforeEachProviders(() => {
        return [
            HTTP_PROVIDERS,
            provide(XHRBackend, {useClass: MockBackend}),
            RetroStore
        ];
    });

    it('should get the board', injectAsync([XHRBackend, RetroStore], (mockBackend, retroStore) => {
        var responseBody;
        return new Promise(
            (resolve) => {

                mockBackend.connections.subscribe(connection => {
                    expect(connection.request.url.toString()).toContain("/board/1");
                    // console.log(connection.request.headers);
                    // expect(connection.request.headers.get("Content-Type")).toEqual("application/json");
                    expect(connection.request.method).toEqual(RequestMethod.Get);

                    responseBody = {
                        items: [
                            {
                                id: 1,
                                message: "I'm a message",
                                status: "ACTIVE",
                                type: "HAPPY",
                                likes: 0,
                                board_id: 1,
                                creation_date: "2016-01-01T20:30:00Z",
                                last_modified_date: "2016-01-01T20:30:00Z"
                            },
                            {
                                id: 2,
                                message: "I'm another message",
                                status: "ACTIVE",
                                type: "HAPPY",
                                likes: 3,
                                board_id: 1,
                                creation_date: "2016-01-01T21:30:00Z",
                                last_modified_date: "2016-01-01T21:30:00Z"
                            },
                            {
                                id: 3,
                                message: "I'm a different message",
                                status: "ACTIVE",
                                type: "UNHAPPY",
                                likes: 1,
                                board_id: 1,
                                creation_date: "2016-01-01T21:32:00Z",
                                last_modified_date: "2016-01-01T21:32:00Z"
                            }]
                    };
                    connection.mockRespond(new Response(new ResponseOptions({
                        status: 200,
                        body: responseBody
                    })));
                });

                retroStore.getBoard().subscribe(
                    (res) => {
                        console.log(res);
                        expect(res).toBe(responseBody);
                        resolve();
                    }
                )
            }
        );
    }));

    it('should send an item to the backend', injectAsync([XHRBackend, RetroStore], (mockBackend, retroStore) => {
        var responseBody;
        let retroItem = new RetroItem({message: 'Text message', type: 'HAPPY', boardId: 1});
        return new Promise(
            (resolve) => {

                mockBackend.connections.subscribe(connection => {

                    var expected = JSON.parse(connection.request.text());
                    expect(retroItem.message).toEqual(expected.message);
                    expect(retroItem.type).toEqual(expected.type);
                    expect(retroItem.board_id).toEqual(expected.board_id);
                    expect(connection.request.url.toString()).toContain("/items");
                    expect(connection.request.headers.get("Content-Type")).toEqual("application/json");
                    expect(connection.request.method).toEqual(RequestMethod.Post);

                    responseBody = {
                        board_id: 1,
                        creation_date: "2016-04-18T16:31:00.972Z",
                        id: 24,
                        last_modified_date: "2016-04-18T16:31:00.972Z",
                        likes: 0,
                        message: "Bar",
                        status: "ACTIVE",
                        type: "HAPPY"
                    };
                    connection.mockRespond(new Response(new ResponseOptions({
                        status: 200,
                        body: responseBody
                    })));
                });

                retroStore.addItem(retroItem).subscribe(
                    (res) => {
                        console.log(res);
                        expect(res).toBe(responseBody);
                        resolve();
                    }
                )
            }
        );
    }));

});