import {Component, Inject} from 'angular2/core';
import ActionService from "./action.service";
import {Action} from "./action";
import {FormBuilder, Control, ControlGroup, Validators} from "angular2/common";
import ActionListComponent from "./action-list/action-list.component";

@Component({
    selector: 'action',
    templateUrl: 'app/action/action.component.html',
    directives: [ActionListComponent],
    styleUrls: ['styles/retrolist.css'] //FIXME gp + dw: review global styles
})
export default class ActionComponent {

    actionService: ActionService;
    formBuilder:FormBuilder;
    form: ControlGroup;

    public description: Control;
    public owner: Control;

    public actions: Action[];

    refreshActionList: boolean = false;

    constructor(actionService: ActionService, formBuilder: FormBuilder) {
        this.formBuilder = formBuilder;
        this.actionService = actionService;
        
        this.description = new Control('', Validators.required);
        this.owner = new Control('', Validators.required);

        this.form = this.formBuilder.group({
            description: this.description,
            owner: this.owner
        });


    }

    addAction() {
        let action = new Action({boardId: 1, description: this.description.value, owner: this.owner.value});
        this.actionService.addAction(action).subscribe({
                next: () => console.log('Action successfully added: ${action}'),
                error: error => {
                    this.handleServerError(error);
                },
                complete: () =>  {
                    this.resetForm();
                    this.refreshActionList = true;
                    // this.ActionListComponent.getActions();
                }
            }
        );
    }

    private resetForm() {
        //TODO errors will remail in the view since there's no way to completely reset the form yet
        this.description.updateValue('');
        this.owner.updateValue('');

        this.form = this.formBuilder.group({
            description: this.description,
            owner: this.owner
        });

    }

    private handleServerError(error) {
        console.log(error); //TODO error handling?
    }
}
