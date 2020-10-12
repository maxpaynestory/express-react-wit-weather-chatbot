import React from "react";
import { Form, Button, Container, Row, Col, Table } from "react-bootstrap";
import axios from "axios";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasJoined: false,
      username: "",
      messages: [],
      question: "",
    };
    this.onJoinBtnClicked = this.onJoinBtnClicked.bind(this);
    this.onUsernameChanged = this.onUsernameChanged.bind(this);
    this.onSendBtnClicked = this.onSendBtnClicked.bind(this);
    this.onQuestionChanged = this.onQuestionChanged.bind(this);
  }
  scrollToBottom(){
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }
  onQuestionChanged(e) {
    this.setState({
      question: e.target.value,
    });
  }
  onSendBtnClicked(e) {
    e.preventDefault();
    const { question, username, messages } = this.state;
    if (question.length > 0) {
      axios
        .post(`${process.env.REACT_APP_API_URL}/message`, {
          username: username,
          text: question,
        })
        .then((res) => {
          if (res.data.length > 0) {
            const newmessages = messages.concat(res.data);
            this.setState({
              messages: newmessages,
            });
            this.scrollToBottom();
          }
        });
      this.setState({
        question: "",
      });
    }
  }
  onJoinBtnClicked(e) {
    e.preventDefault();
    const { username } = this.state;
    if (username.length > 2) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/message?username=${username}`)
        .then((res) => {
          this.setState({
            messages: res.data,
            hasJoined: true,
          });
          this.scrollToBottom();
        });
    }
  }
  onUsernameChanged(e) {
    this.setState({
      username: e.target.value,
    });
  }
  render() {
    const { hasJoined, username, messages, question } = this.state;
    let trs = (
      <tr>
        <td></td>
      </tr>
    );
    trs = messages.map((message) => {
      return (
        <tr key={message._id}>
          <td>{message.text}</td>
        </tr>
      );
    });
    return (
      <div className="App">
        <Container
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {!hasJoined ? (
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={this.onUsernameChanged}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                onClick={this.onJoinBtnClicked}
              >
                Join Chat
              </Button>
            </Form>
          ) : (
            <Container>
              <Row>
                <Col>
                  <Container className="table-wrapper-scroll-y my-custom-scrollbar">
                    <Table responsive={true}>
                      <tbody>{trs}</tbody>
                    </Table>
                    <div
                      style={{ float: "left", clear: "both" }}
                      ref={(el) => {
                        this.messagesEnd = el;
                      }}
                    ></div>
                  </Container>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form>
                    <Form.Group controlId="formBasicEmail">
                      <Row>
                        <Col sm={11}>
                          <Form.Control
                            type="text"
                            placeholder="Enter question"
                            value={question}
                            onChange={this.onQuestionChanged}
                          />
                        </Col>
                        <Col sm={1}>
                          <Button
                            variant="primary"
                            type="button"
                            onClick={this.onSendBtnClicked}
                          >
                            Send
                          </Button>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
            </Container>
          )}
        </Container>
      </div>
    );
  }
}

export default App;
