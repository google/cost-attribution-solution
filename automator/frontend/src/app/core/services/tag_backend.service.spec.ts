import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing"; // Import testing module and controller
import { TagBackendService } from "./tag_backend.service";
import { SERVICE_CONFIG } from "../model/values"; // Import the token
import {
  Response,
  BulkResponse,
  ResourceTags,
  Tag,
  Binding,
} from "../model/models"; // Import necessary types

describe("TagBackendService", () => {
  // Renamed describe block
  let service: TagBackendService;
  let httpMock: HttpTestingController; // Controller to mock HTTP requests
  const mockApiUrl = "http://mock-api.com";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Import the testing module for HttpClient
      ],
      providers: [
        TagBackendService, // Provide the service itself
        { provide: SERVICE_CONFIG, useValue: { apiUrl: mockApiUrl } }, // Provide a mock value for the config
      ],
    });
    // Inject the service and the mock controller
    service = TestBed.inject(TagBackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Verify that no requests are outstanding after each test
  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fetch tags", () => {
    const dummyTags: Tag[] = [
      {
        key: { id: "k1", value: "Key1" },
        values: [{ id: "v1", value: "Value1" }],
      },
      {
        key: { id: "k2", value: "Key2" },
        values: [{ id: "v2", value: "Value2" }],
      },
    ];

    service.fetchTags().subscribe((tags) => {
      expect(tags.length).toBe(2);
      expect(tags).toEqual(dummyTags);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/tags`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyTags);
  });

  it("should fetch resources", () => {
    const dummyResources: ResourceTags[] = [
      {
        id: "res1",
        name: "Resource1",
        type: "type1",
        location: "loc1",
        tags: [],
      },
    ];

    service.fetchResources().subscribe((resources) => {
      expect(resources.length).toBe(1);
      expect(resources).toEqual(dummyResources);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/resources?type=tags`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyResources);
  });

  it("should delete a tag", () => {
    const keyToDelete = "tagKey123";
    const mockResponse: Response = { detail: "Tag deleted successfully" };

    service.deleteTag(keyToDelete).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/tags/${keyToDelete}`);
    expect(req.request.method).toBe("DELETE");
    req.flush(mockResponse);
  });

  it("should edit a tag", () => {
    const keyToEdit = "tagKey456";
    const values = ["value1", "value2"];
    const mockResponse: Response = { detail: "Tag values updated" };

    service.editTag(keyToEdit, values).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/tags/tagValues`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ key: keyToEdit, values });
    req.flush(mockResponse);
  });

  it("should add a tag", () => {
    const tagName = "NewTag";
    const tagDescription = "A description";
    const mockResponse = { key: "newTagKey789" };

    service.addTag(tagName, tagDescription).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/tags`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({
      name: tagName,
      description: tagDescription,
    });
    req.flush(mockResponse);
  });

  it("should update resource tags", () => {
    const resourceId = "res1";
    const location = "loc1";
    const tags: Binding[] = [{ id: "tagKey1", value: "tagValue1" }];
    const mockResponse: Response = { detail: "Resource tags updated" };

    service
      .updateResourceTags(resourceId, location, tags)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${mockApiUrl}/resources/tags`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ id: resourceId, location, tags });
    req.flush(mockResponse);
  });

  it("should add tags to resources", () => {
    const resources = [
      { id: "res1", location: "loc1" },
      { id: "res2", location: "loc2" },
    ];
    const tags: Binding[] = [{ id: "tagKeyAdd", value: "tagValueAdd" }];
    const mockResponse: BulkResponse = { detail: "Tags added", errors: [] };

    service.addTagsToResources(resources, tags).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/resources/tags`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ resources, tags });
    req.flush(mockResponse);
  });

  it("should remove tags from resources", () => {
    const resources = [{ id: "res1", location: "loc1" }];
    const tags: Binding[] = [{ id: "tagKeyRemove", value: "tagValueRemove" }];
    const mockResponse: BulkResponse = { detail: "Tags removed", errors: [] };

    service.removeTagsFromResources(resources, tags).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/resources/tags`);
    expect(req.request.method).toBe("DELETE");
    // DELETE request body is accessed via request.body in HttpTestingController
    expect(req.request.body).toEqual({ resources, tags });
    req.flush(mockResponse);
  });
});
