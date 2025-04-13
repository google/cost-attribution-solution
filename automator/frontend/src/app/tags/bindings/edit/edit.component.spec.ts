import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms"; // Keep
import { NoopAnimationsModule } from "@angular/platform-browser/animations"; // Keep
import { MatFormFieldModule } from "@angular/material/form-field"; // Keep
import { MatSelectModule } from "@angular/material/select"; // Keep
import { MatIconModule } from "@angular/material/icon"; // Keep
import { MatButtonModule } from "@angular/material/button"; // Keep

import { EditComponent } from "./edit.component"; // Keep (standalone)
import { TagsController, Binding, Value } from "../../../core/model/models";

// --- Mock TagsController ---
class MockTagsController implements TagsController {
    tags = [];
    keys: Value[] = [
        { id: "key1", value: "Key One" },
        { id: "key2", value: "Key Two" },
    ];

    filterValues(keyId: string): Value[] {
        if (keyId === "key1") {
            return [
                { id: "val1a", value: "Value 1a" },
                { id: "val1b", value: "Value 1b" },
            ];
        }
        if (keyId === "key2") {
            return [{ id: "val2a", value: "Value 2a" }];
        }
        return [];
    }
    getKeyName = (keyId: string) =>
        this.keys.find((k) => k.id === keyId)?.value;
    getValueName = (keyId: string, valueId: string) =>
        this.filterValues(keyId).find((v) => v.id === valueId)?.value;
}
// --- End Mock TagsController ---

describe("EditComponent (Tags Bindings)", () => {
    let component: EditComponent;
    let fixture: ComponentFixture<EditComponent>;
    let mockTagsController: MockTagsController;

    beforeEach(async () => {
        mockTagsController = new MockTagsController();

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                NoopAnimationsModule,
                MatFormFieldModule,
                MatSelectModule,
                MatIconModule,
                MatButtonModule,
                EditComponent, // Import the standalone component
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EditComponent);
        component = fixture.componentInstance;
        component.availableTags = mockTagsController;
    });

    // ... rest of the tests remain the same ...

    it("should create", () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it("should initialize with empty form array if no bindings provided", () => {
        fixture.detectChanges();
        expect(component.tagBindingsForm.length).toBe(0);
        expect(component.form.valid).toBeTrue();
    });

    it("should initialize form array with provided tagBindings", () => {
        const initialBindings: Binding[] = [
            { id: "key1", value: "val1a" },
            { id: "key2", value: "val2a" },
        ];
        component.tagBindings = initialBindings;
        fixture.detectChanges();

        expect(component.tagBindingsForm.length).toBe(2);
        expect(component.tagBindingsForm.at(0).value).toEqual({
            key: "key1",
            value: "val1a",
        });
        expect(component.tagBindingsForm.at(1).value).toEqual({
            key: "key2",
            value: "val2a",
        });
        expect(component.form.valid).toBeTrue();
    });

    it("should add a new binding group when newBinding() is called", () => {
        fixture.detectChanges();
        component.newBinding();
        fixture.detectChanges();

        expect(component.tagBindingsForm.length).toBe(1);
        const newGroup = component.tagBindingsForm.at(0);
        expect(newGroup.get("key")?.value).toBe("");
        expect(newGroup.get("value")?.disabled).toBeTrue();
        expect(component.form.valid).toBeFalse();
    });

    it("should disable add button if form is invalid", () => {
        fixture.detectChanges();
        component.newBinding();
        fixture.detectChanges();
        const addButton = fixture.nativeElement.querySelector(
            ".new-tag-btn",
        ) as HTMLButtonElement;
        expect(addButton.disabled).toBeTrue();
    });

    // Corrected test - interacts via public API
    it("should enable add button if form is valid", () => {
        fixture.detectChanges(); // Start with a valid empty form
        const addButton = fixture.nativeElement.querySelector(
            ".new-tag-btn",
        ) as HTMLButtonElement;
        expect(addButton.disabled).toBeFalse(); // Button should be enabled initially

        component.newBinding(); // Add a new, invalid row
        fixture.detectChanges();
        expect(addButton.disabled).toBeTrue(); // Button disabled

        // Make the row valid
        component.tagBindingsForm.at(0).get("key")?.setValue("key1");
        component.tagBindingsForm.at(0).get("value")?.setValue("val1a");
        fixture.detectChanges();
        expect(addButton.disabled).toBeFalse(); // Button enabled again
    });

    it("should remove a binding group when deleteBinding() is called", () => {
        component.tagBindings = [{ id: "key1", value: "val1a" }];
        fixture.detectChanges();
        expect(component.tagBindingsForm.length).toBe(1);

        component.deleteBinding(0);
        fixture.detectChanges();

        expect(component.tagBindingsForm.length).toBe(0);
        expect(component.form.valid).toBeTrue();
    });

    it("should filter keys correctly", () => {
        fixture.detectChanges();
        const keys = component.filterKeys();
        expect(keys).toEqual(mockTagsController.keys);
    });

    it("should filter values correctly based on selected key", () => {
        fixture.detectChanges();
        component.newBinding();
        fixture.detectChanges();

        const group = component.tagBindingsForm.at(0);
        group.get("key")?.setValue("key1");
        fixture.detectChanges();

        const values = component.filterValues(0);
        expect(values).toEqual(mockTagsController.filterValues("key1"));
    });

    it("should enable value control when key is selected", () => {
        fixture.detectChanges();
        component.newBinding();
        fixture.detectChanges();
        const keyControl = component.tagBindingsForm.at(0).get("key");
        const valueControl = component.tagBindingsForm.at(0).get("value");

        expect(valueControl?.disabled).toBeTrue();
        keyControl?.setValue("key1");
        fixture.detectChanges();
        expect(valueControl?.disabled).toBeFalse();
        expect(valueControl?.value).toBeNull();
    });

    it("should mark form as invalid if required fields are missing", () => {
        fixture.detectChanges();
        component.newBinding();
        fixture.detectChanges();
        expect(component.form.valid).toBeFalse();

        const keyControl = component.tagBindingsForm.at(0).get("key");
        keyControl?.setValue("key1");
        fixture.detectChanges();
        expect(component.form.valid).toBeFalse();

        const valueControl = component.tagBindingsForm.at(0).get("value");
        valueControl?.setValue("val1a");
        fixture.detectChanges();
        expect(component.form.valid).toBeTrue();
    });

    it("should mark key control as invalid if key is duplicated", () => {
        fixture.detectChanges();
        component.newBinding();
        component.newBinding();
        fixture.detectChanges();

        const keyControl1 = component.tagBindingsForm.at(0).get("key");
        const valueControl1 = component.tagBindingsForm.at(0).get("value");
        const keyControl2 = component.tagBindingsForm.at(1).get("key");
        const valueControl2 = component.tagBindingsForm.at(1).get("value");

        keyControl1?.setValue("key1");
        valueControl1?.setValue("val1a");

        keyControl2?.setValue("key1");
        valueControl2?.setValue("val1b");
        fixture.detectChanges();

        expect(keyControl1?.valid).toBeTrue();
        expect(keyControl2?.hasError("duplicateKey")).toBeTrue();
        expect(component.form.valid).toBeFalse();
    });

    // Corrected test with extra detectChanges after tick
    it("should emit `valid` status changes", fakeAsync(() => {
        let lastValidStatus: boolean | undefined;
        component.valid.subscribe((status) => {
            lastValidStatus = status;
        });

        // Make invalid
        lastValidStatus = undefined; // Reset
        component.newBinding();
        fixture.detectChanges();
        tick();
        expect(lastValidStatus)
            .withContext("Status after adding invalid row")
            .toBeFalse();

        // Make valid
        lastValidStatus = undefined; // Reset
        component.tagBindingsForm.at(0).get("key")?.setValue("key1");
        component.tagBindingsForm.at(0).get("value")?.setValue("val1a");
        fixture.detectChanges(); // Detect value changes
        tick(); // Process microtasks (emit)
        fixture.detectChanges(); // <<< Ensure component updates based on emission if needed

        expect(lastValidStatus)
            .withContext("Status after making row valid")
            .toBeTrue();
    }));

    it("should emit `tags` array changes", fakeAsync(() => {
        fixture.detectChanges();
        let emittedTags: Value[] = [];
        component.tags.subscribe((tags) => (emittedTags = tags));

        tick();
        expect(emittedTags).toEqual([]);

        // Add first binding
        component.newBinding();
        component.tagBindingsForm.at(0).get("key")?.setValue("key1");
        component.tagBindingsForm.at(0).get("value")?.setValue("val1a");
        fixture.detectChanges();
        tick();
        expect(emittedTags).toEqual([{ id: "key1", value: "val1a" }]);

        // Add second binding
        component.newBinding();
        component.tagBindingsForm.at(1).get("key")?.setValue("key2");
        component.tagBindingsForm.at(1).get("value")?.setValue("val2a");
        fixture.detectChanges();
        tick();
        expect(emittedTags).toEqual([
            { id: "key1", value: "val1a" },
            { id: "key2", value: "val2a" },
        ]);

        // Remove first binding
        component.deleteBinding(0);
        fixture.detectChanges();
        tick();
        expect(emittedTags).toEqual([{ id: "key2", value: "val2a" }]);
    }));
});
