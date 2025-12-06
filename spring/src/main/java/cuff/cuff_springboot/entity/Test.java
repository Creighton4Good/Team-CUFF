package cuff.cuff_springboot.entity;
public class Test {
    public static void main(String[] args) {

        User user = new User(
            "Becca",
            "Borgmeier",
            "becca@test.com",
            "password111",
            "Both",
            "vegan",
            false
        );

        System.out.println("Name: " + user.getFirstName() + " " + user.getLastName());
        System.out.println("Email: " + user.getEmail());
        System.out.println("Notification: " + user.getNotificationType());
    }
}
